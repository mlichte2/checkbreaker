<script>
  import { createEventDispatcher } from "svelte";
  import { FREEOCR_API_KEY } from "../keys";

  const dispatch = createEventDispatcher();

  let formData = new FormData();

  let files = [];
  let results = [];
  let textResults = [];
  let receiptInfo = [];

  const sendImage = async () => {
    const settings = {
      method: "POST",
      headers: {
        apikey: FREEOCR_API_KEY,
      },
      body: formData,
    };
    try {
      const fetchResponse = await fetch(
        `https://api.ocr.space/parse/image`,
        settings
      );
      //console.log(fetchResponse);
      const data = await fetchResponse.json();
      // console.log(data);
      results = await data["ParsedResults"][0].TextOverlay.Lines;
      textResults = await data["ParsedResults"][0].ParsedText;
      // console.log(results);
      return data["ParsedResults"];
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleClick = async () => {
    // console.log(files[0]);
    if (files[0].size > 1073741.82) {
      alert(
        "File size is too large, please compress or upload a different image!"
      );
    } else {
      formData.append("file", files[0]);
      formData.append("isTable", "true");
      sendImage();
    }
  };

  const handleNextButton = () => {
    receiptInfo = [
      ...receiptInfo,
      { textResults: textResults, lineItemArray: results, imageFile: files[0] },
    ];
    dispatch("gotReceiptInfo", receiptInfo);
  };
</script>

<div class="file-input">
  <p>
    Instructions: Upload and submit a receipt image to retreive the text; once
    done click "Next". This will be used on the next step. If you'd rather
    manually add each item, press "Skip."
  </p>
  <br />
  <label for="file">Upload a receipt image (max file size 1.024 MB): </label>
  <input accept="image/png, image/jpeg" bind:files type="file" />
  <button on:click={() => handleClick()}>Submit</button>
  <div>
    <p class="returned-text">{textResults}</p>
  </div>
  <!-- <div>
    {#each results as result}
      <p>{result.LineText}</p>
    {/each}
  </div> -->
  {#if textResults.length > 1}
    <button on:click={handleNextButton}>Next</button>
  {:else}
    <button on:click={handleNextButton}>Skip</button>
  {/if}
</div>

<style>
  .file-input {
    margin: auto;
    text-align: center;
    padding: 20px;
    max-width: 400px;
  }
  .returned-text {
    border-style: solid;
  }
</style>
