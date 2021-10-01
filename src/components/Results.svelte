<script>
  export let itemsArray;
  export let people;

  let salesTax;
  let tip;
  let fullTotal;
  let fullyCalculated = false;

  const iterateFunction = () => {
    people.forEach((person) => {
      let id = person.id;
      itemsArray.forEach((item) => {
        let peopleWhoAteID = item.peopleWhoAteIDs;
        peopleWhoAteID.forEach((element) => {
          //   console.log(id, element[0], item);
          if (id === element[0]) {
            person.total +=
              (parseFloat(item.itemAmount) * item.quantity) /
              item.peopleWhoAteIDs.length;
            person.itemsOrdered.push([
              item.itemName,
              item.itemAmount,
              item.quantity.toFixed(3) / item.peopleWhoAteIDs.length,
            ]);
          }
        });
        // console.log(person, item);
      });
    });
    console.log(people);
  };

  let subtotal = 0;

  const calculatesubtotal = () => {
    itemsArray.forEach((item) => {
      subtotal += parseFloat(item.itemAmount) * item.quantity;
    });
    console.log(subtotal);
  };

  const calculatePercentageTotal = () => {
    people.forEach((person) => {
      person.percentageOfTotal = person.total / subtotal;
      person.percentageOfSalesTax = person.percentageOfTotal * salesTax;
      person.percentageOfTip = person.percentageOfTotal * tip;
      person.total += person.percentageOfTip + person.percentageOfSalesTax;
    });
  };

  // handle submit button which adds sales tax and tip amount and pushed to firebase
  const handleSubmitButton = () => {
    fullyCalculated = true;
    iterateFunction();
    calculatesubtotal();
    calculatePercentageTotal();
    fullTotal = subtotal + tip + salesTax;
  };
</script>

<div class="show-results">
  {#if fullyCalculated === false}
    <div>
      <form on:submit|preventDefault|once={handleSubmitButton}>
        <h4>One last step, please enter the sales tax and tip</h4>
        <input
          type="number"
          min="0"
          placeholder="Sales Tax Amount"
          bind:value={salesTax}
        />
        <input
          type="number"
          min="0"
          placeholder="Tip Amount"
          bind:value={tip}
        />
        <button>Calculate</button>
      </form>
    </div>
  {:else}
    <div>
      {#each people as person}
        <div class="person-card">
          <h2>{person.name}</h2>
          <h4>Summary:</h4>
          {#each person.itemsOrdered as item}
            <p>
              {item[2].toFixed(2)} Units, @ ${item[1]} |
              {item[0]} | Item Cost (w/ Quantity): ${(
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
    </div>
  {/if}
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
    border-radius: 10px;
    margin-bottom: 10px;
  }
</style>
