<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // declaring variables which we will be binding to below on input form

  let item = "";
  let amount;
  let peopleWhoAte = [];
  let quantity = 1;

  // reactive variable to add an ID to each

  let items = [];
  $: id = items.length + 1;

  // importing props from App.svelte

  export let people;
  export let receiptInfo;

  // form validation

  let valid = false;

  let error = {
    name: "",
    amount: "",
  };

  // delete item

  const clear = (id) => {
    // console.log("click");
    items = items.filter((item) => item.id != id);
    items.forEach((item) => {
      if (item.id > id) {
        item.id--;
      }
    });
  };

  const handleSubmit = () => {
    valid = true;
    if (item.length < 1) {
      valid = false;
      error.name = "Name cannot be empty";
    }
    if (amount <= 0) {
      valid = false;
      error.amount = "Price must be greater than 0";
    } else if (amount === undefined) {
      valid = false;
      error.amount = "Please enter an amount";
    } else if (amount[0] === "$") {
      valid = false;
      error.amount = 'Please remove "$"';
      // add one below for number of decimal places
    } else {
      error.name = "";
      error.amount = "";
    }

    if (valid) {
      items = [
        ...items,
        {
          id: id,
          itemName: item,
          itemAmount: amount,
          quantity: quantity,
          peopleWhoAteIDs: peopleWhoAte,
        },
      ];
      item = "";
      amount = null;
      // console.log(items);
    }
  };

  const handleNextButton = () => {
    // console.log(items);
    dispatch("gotItemsArray", items);
  };
</script>

<div class="add-items-container">
  <p>
    Please enter the items that were ordered as well as the price. Once you have
    entered more than 2 items, please click <strong>"Next"</strong>
  </p>
  <div class="show-items">
    <div>
      {#if receiptInfo[0].textResults.length > 1}
        <h3>Copy and paste info from the text from your receipt!</h3>
        <p class="returned-text">{receiptInfo[0].textResults}</p>
        <!-- {:else}
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis
          natus a eligendi quisquam quam blanditiis accusantium at, distinctio
          ipsam corrupti facilis repudiandae, dolor totam unde? Provident quod
          necessitatibus cupiditate ipsum.
        </p> -->
      {/if}
    </div>
    <div>
      <h2 class="heading">Items</h2>
      <ul class="item-list">
        {#each items as item}
          <li class="list-item">
            <div>
              <p>
                Quantity: {item.quantity} | Name: {item.itemName} | Price: ${item.itemAmount}
                | Item Total: ${item.quantity * item.itemAmount}
              </p>
            </div>

            <div>
              <p>{item.peopleWhoAteIDs.join(", ")}</p>
            </div>
            <div>
              <button
                class="remove-button"
                on:click={() => {
                  clear(item.id);
                }}>Delete</button
              >
            </div>
            <br />
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="add-item">
    <form on:submit|preventDefault={handleSubmit}>
      <input type="text" placeholder="add item name" bind:value={item} />
      <div class="error">{error.name}</div>
      <input type="text" placeholder="add price amount" bind:value={amount} />
      <div class="error">{error.amount}</div>
      <div>
        <input
          type="number"
          placeholder="Quantity"
          class="quantity"
          bind:value={quantity}
        />
      </div>
      <div class="name-checkbox">
        {#each people as person}
          <div>
            <input
              type="checkbox"
              bind:group={peopleWhoAte}
              value={[person.id, person.name]}
            />
            {person.name}<br />
          </div>
        {/each}
      </div>
      <br />
      <!-- <div class="error">{error.name}</div> -->
      <button>Add</button>
    </form>
    <br />
    {#if items.length > 1}
      <button on:click={handleNextButton}>Next</button>
    {/if}
  </div>
</div>

<style>
  .add-items-container {
    margin: auto;
    text-align: center;
    padding: 20px;
    max-width: 600px;
  }
  .show-items {
    text-align: left;
    display: flex;
    flex-direction: column;
  }
  .remove-button {
    font-size: small;
    align-items: right;
    background-color: red;
    color: white;
    height: 28px;
    width: 60px;
  }
  .heading {
    text-align: center;
  }
  .list-item {
    display: flex;
    flex-direction: column;
    border-style: solid;
    border-color: black;
    text-align: center;
    padding: 10px;
    border-radius: 10px;
  }
  .returned-text {
    border-style: solid;
  }
  .error {
    font-weight: bold;
    font-size: 12px;
    color: red;
  }
  .quantity {
    width: 100px;
  }
</style>
