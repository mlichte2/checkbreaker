<script>
  import db from "../firebase";

  export let itemsArray;
  export let people;

  let salesTax;
  let tip;
  let fullTotal;
  let fullyCalculated = false;

  //   let people = [
  //     {
  //       id: 1,
  //       name: "Michael",
  //       total: 0,
  //       itemsOrdered: [],
  //     },
  //     {
  //       id: 2,
  //       name: "Kevin",
  //       total: 0,
  //       itemsOrdered: [],
  //     },
  //     {
  //       id: 3,
  //       name: "Asad",
  //       total: 0,
  //       itemsOrdered: [],
  //     },
  //     {
  //       id: 4,
  //       name: "Rob",
  //       total: 0,
  //       itemsOrdered: [],
  //     },
  //   ];

  //   let itemsArray = [
  //     {
  //       id: 1,
  //       itemName: "Beers",
  //       itemAmount: "5",
  //       quantity: 8,
  //       peopleWhoAteIDs: [
  //         [1, "Michael"],
  //         [2, "Kevin"],
  //         [3, "Asad"],
  //         [4, "Rob"],
  //       ],
  //     },
  //     {
  //       id: 2,
  //       itemName: "Wings",
  //       itemAmount: "20",
  //       quantity: 1,
  //       peopleWhoAteIDs: [
  //         [1, "Michael"],
  //         [2, "Kevin"],
  //       ],
  //     },
  //     {
  //       id: 3,
  //       itemName: "Crab leg",
  //       itemAmount: "100",
  //       quantity: 1,
  //       peopleWhoAteIDs: [
  //         [1, "Michael"],
  //         [2, "Kevin"],
  //         [3, "Asad"],
  //       ],
  //     },
  //     {
  //       id: 4,
  //       itemName: "whisky shots",
  //       itemAmount: "10",
  //       quantity: 3,
  //       peopleWhoAteIDs: [
  //         [2, "Kevin"],
  //         [3, "Asad"],
  //         [4, "Rob"],
  //       ],
  //     },
  //     {
  //       id: 5,
  //       itemName: "vodka red bulls",
  //       itemAmount: "12",
  //       quantity: 2,
  //       peopleWhoAteIDs: [
  //         [2, "Kevin"],
  //         [4, "Rob"],
  //       ],
  //     },
  //     {
  //       id: 6,
  //       itemName: "burgers",
  //       itemAmount: "15",
  //       quantity: 4,
  //       peopleWhoAteIDs: [
  //         [1, "Michael"],
  //         [2, "Kevin"],
  //         [3, "Asad"],
  //         [4, "Rob"],
  //       ],
  //     },
  //   ];

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

      console.log(person);
    });
  };

  // firebase stuff

  let firebasePathID;

  const pushToFirebase = (people, itemsArray, subtotal, salesTax, tip) => {
    db.ref("finished-results")
      .push({
        people: people,
        itemsArray: itemsArray,
        subtotal: subtotal,
        salesTax: salesTax,
        tip: tip,
      })
      .then((result) => {
        firebasePathID = result._delegate._path.pieces_[1];
        console.log(result);
        console.log(firebasePathID);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // handle submit button which adds sales tax and tip amount and pushed to firebase
  const handleSubmitButton = () => {
    fullyCalculated = true;
    iterateFunction();
    calculatesubtotal();
    calculatePercentageTotal();
    fullTotal = subtotal + tip + salesTax;
    pushToFirebase(people, itemsArray, subtotal, salesTax, tip);

    console.log(fullTotal);
  };
</script>

<div class="show-results">
  {#if firebasePathID}
    <h3 class="firebase-string">
      Save this string <strong>"{firebasePathID}"</strong> in case you want to
      reference this session again! You can do so by clicking
      <strong>Search</strong>! Cheers 🍻!
    </h3>
  {/if}
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
  }
  .firebase-string {
    color: white;
    background-color: maroon;
    text-align: left;
  }
</style>
