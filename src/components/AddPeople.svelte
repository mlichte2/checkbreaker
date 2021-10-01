<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  //create empty array to push to later
  let people = [];
  // increments to add create a unique ID value in the people object
  $: id = people.length + 1;
  // validating errors
  let error = {
    name: "",
  };

  let name = "";
  let total = 0;

  //form validation
  let valid = false;

  const handleSubmit = () => {
    valid = true;
    if (name.length < 1) {
      valid = false;
      error.name = "Name cannot be empty";
    } else {
      error.name = "";
    }

    if (valid) {
      people = [
        ...people,
        {
          id: id,
          name: name,
          total,
          itemsOrdered: [],
          percentageOfTotal: 0,
          percentageOfSalesTax: 0,
          percentageOfTip: 0,
        },
      ];
      name = "";
      // console.log(people);
    }
  };
  // delete name from name array
  const clear = (id) => {
    people = people.filter((person) => person.id != id);
    // for each loop + if statment to subtract the id from anyone with an id greater than the person who was deleted
    people.forEach((person) => {
      if (person.id > id) {
        person.id--;
      }
    });
    // console.log(people);
  };

  // handles next button and passes the "gotPeopleObject" action up to App.svelte
  const handleNextButton = () => {
    dispatch("gotPeopleObject", people);
  };
</script>

<div class="add-people-container">
  <div class="show-people">
    <p>
      Please enter the names of the persons you dined with below. Once you have
      entered more than 2 diners, please click <strong>"Next"</strong>
    </p>
    <h2 class="heading">People</h2>
    <ul class="people-list">
      {#each people as person}
        <li class="list-item">
          {person.id}:
          {person.name}

          <button
            class="remove-button"
            on:click={() => {
              clear(person.id);
            }}>Delete</button
          >
        </li>
      {/each}
    </ul>
  </div>

  <div class="add-person">
    <form on:submit|preventDefault={handleSubmit}>
      <input type="text" placeholder="add person" bind:value={name} />
      <div class="error">{error.name}</div>
      <br class="break" />
      <button>Add</button>
    </form>
    <br class="break" />
    {#if people.length > 1}
      <button on:click={handleNextButton}>Next</button>
    {/if}
  </div>
</div>

<style>
  .add-people-container {
    margin: auto;
    text-align: center;
    padding: 20px;
    max-width: 400px;
  }
  .show-people {
    text-align: left;
  }
  .error {
    font-weight: bold;
    font-size: 12px;
    color: red;
  }
  .remove-button {
    font-size: small;
    align-items: right;
    background-color: red;
    color: white;
  }
  .heading {
    text-align: center;
  }
  .list-item {
    display: flex;
    justify-content: space-between;
    border-style: solid;
    border-color: black;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 10px;
  }
</style>
