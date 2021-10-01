<script>
  import AddPeople from "./components/AddPeople.svelte";
  import AddItems from "./components/AddItems.svelte";

  import Results from "./components/Results.svelte";

  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import Tabs from "./shared/Tabs.svelte";

  let items = ["Add People", "Add Items", "Results"];
  let activeItem = "Add People";

  let people = [];
  let receiptInfo = [];
  let itemsArray = [];

  const handlePeople = (event) => {
    people = event.detail;
    // console.log(`People added ${people}`);
    activeItem = "Add Items";
    return people;
  };

  const handleItemsArray = (event) => {
    itemsArray = event.detail;
    // console.log(itemsArray);
    activeItem = "Results";
    return itemsArray;
  };
</script>

<main>
  <Header />
  <Tabs {activeItem} {items} />
  {#if activeItem === "Add People"}
    <AddPeople on:gotPeopleObject={handlePeople} />
  {:else if activeItem === "Add Items"}
    <AddItems {people} on:gotItemsArray={handleItemsArray} />
  {:else if activeItem === "Results"}
    <Results {itemsArray} {people} />
  {/if}
  <Footer />
</main>

<style>
</style>
