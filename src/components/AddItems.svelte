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

  // form validation

  let valid = false;

  let error = {
    name: "",
    amount: "",
    quantity: "",
    checkbox: "",
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
    } else if (!amount.match(/^-?\d+$/) && !amount.match(/^\d+\.\d+$/)) {
      valid = false;
      error.amount = "Please enter a number";
    } else if (quantity < 1) {
      valid = false;
      error.quantity = "You must enter a quantity larger than 1";
    } else if (peopleWhoAte.length < 1) {
      valid = false;
      error.checkbox = "At least one person must be selected";
    } else {
      error.name = "";
      error.amount = "";
      error.quantity = "";
      error.checkbox = "";
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
      quantity = 1;
      peopleWhoAte = [];
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
              {#each item.peopleWhoAteIDs as person}
                <p>{person[1]}</p>
              {/each}
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
        <div class="error">{error.quantity}</div>
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
            <div class="error">{error.checkbox}</div>
            <br />
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
    margin-bottom: 10px;
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
