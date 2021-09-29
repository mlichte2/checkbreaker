<script>
  import db from "../firebase";

  let firebasePathID;

  let fullyCalculated = false;
  let people;
  let itemsArray;
  let subtotal;
  let salesTax;
  let tip;

  // "-Mkl55KsEnBp8zhHpt5F";

  let firebaseResult;

  const getPastSession = (firebasePathID) => {
    db.ref(`finished-results/${firebasePathID}`)
      .get()
      .then((result) => {
        firebaseResult = result.val();
        // console.log(firebaseResult);
        if (firebaseResult) {
          fullyCalculated = true;
          //   console.log("working");
          people = firebaseResult.people;
          itemsArray = firebaseResult.itemsArray;
          subtotal = firebaseResult.subtotal;
          salesTax = firebaseResult.salesTax;
          tip = firebaseResult.tip;
        } else {
          console.log("no item found");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
</script>

<div class="show-results">
  <input type="text" bind:value={firebasePathID} />
  <button on:click|once={getPastSession(firebasePathID)}>Submit</button>
  {#if firebaseResult === null}
    <p>No result found...</p>
  {/if}
  <div>
    {#if fullyCalculated === true}
      {#each people as person}
        <div class="person-card">
          <h2>{person.name}</h2>
          <h4>Summary:</h4>
          {#each person.itemsOrdered as item}
            <p>
              {item[2].toFixed(2)}, ${item[1]}
              {item[0]} | Item Amount (w/ Quantity): ${(
                item[1] * item[2]
              ).toFixed(2)}
            </p>
          {/each}
          <p>
            Subtotal = ${(
              person.total -
              (person.percentageOfTip + person.percentageOfSalesTax)
            ).toFixed(2)}
          </p>
          <p>
            Percentage of Sales Tax = ${person.percentageOfSalesTax.toFixed(2)}
          </p>
          <p>Percentage of Tip = ${person.percentageOfTip.toFixed(2)}</p>

          <p><strong>Total Amount = ${person.total.toFixed(2)}</strong></p>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .show-results {
    margin: auto;
    text-align: center;
    padding: 20px;
    max-width: 600px;
  }
  .person-card {
    border-style: solid;
    padding: 2%;
  }
</style>
