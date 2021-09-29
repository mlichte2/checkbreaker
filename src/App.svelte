<script>
  import AddPeople from "./components/AddPeople.svelte";
  import AddItems from "./components/AddItems.svelte";
  import OCR from "./components/OCR.svelte";
  import Results from "./components/Results.svelte";
  import Search from "./components/Search.svelte";

  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import Tabs from "./shared/Tabs.svelte";

  let items = [
    "Add People",
    "Scan Receipt",
    "Add Items",
    "Results",
    "Search Past Sessions",
  ];
  let activeItem = "Add People";

  let people = [];
  let receiptInfo = [];
  let itemsArray = [];

  const handlePeople = (event) => {
    people = event.detail;
    // console.log(`People added ${people}`);
    activeItem = "Scan Receipt";
    return people;
  };

  const handleReceiptInfo = (event) => {
    receiptInfo = event.detail;
    // console.log(receiptInfo);
    activeItem = "Add Items";
    return receiptInfo;
  };

  const handleItemsArray = (event) => {
    itemsArray = event.detail;
    // console.log(itemsArray);
    activeItem = "Results";
    return itemsArray;
  };

  const searchPastSessions = () => {
    activeItem = "Search Past Sessions";
  };
</script>

<main>
  <Header />
  <Tabs {activeItem} {items} />
  {#if activeItem === "Add People"}
    <AddPeople
      on:gotPeopleObject={handlePeople}
      on:searchPastSessions={searchPastSessions}
    />
  {:else if activeItem === "Scan Receipt"}
    <OCR on:gotReceiptInfo={handleReceiptInfo} />
  {:else if activeItem === "Add Items"}
    <AddItems {people} {receiptInfo} on:gotItemsArray={handleItemsArray} />
  {:else if activeItem === "Results"}
    <Results {itemsArray} {people} />
  {:else if activeItem === "Search Past Sessions"}
    <Search />
  {/if}
  <Footer />
</main>

<style>
</style>
