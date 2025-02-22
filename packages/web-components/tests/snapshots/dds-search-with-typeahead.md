# `dds-search-with-typeahead`

## `Misc attributes`

####   `should render with minimum attributes`

```
<div class="bx--header__search--actions">
  <button
    aria-label="Open IBM search field"
    class="bx--header__action bx--header__search--search"
    part="open-button"
    type="button"
  >
  </button>
  <button
    aria-label="Clear input"
    class="bx--header__action bx--header__search--close"
    part="close-button"
    type="button"
  >
  </button>
</div>

```

####   `should render with various attributes in the inactive state`

```
<div class="bx--header__search--actions">
  <button
    aria-label="open-search-button-assistive-text-foo"
    class="bx--header__action bx--header__search--search"
    part="open-button"
    type="button"
  >
  </button>
  <button
    aria-label="Clear input"
    class="bx--header__action bx--header__search--close"
    part="close-button"
    type="button"
  >
  </button>
</div>

```

####   `should render with various attributes`

```
<form
  action="https://www.ibm.com/search"
  method="get"
  role="search"
>
  <input
    name="lang"
    type="hidden"
    value="ko"
  >
  <input
    name="cc"
    type="hidden"
    value="KR"
  >
  <input
    name="lnk"
    type="hidden"
    value="mhsrch"
  >
  <div
    aria-expanded="true"
    aria-haspopup="listbox"
    aria-label="IBM search field"
    aria-owns="result-list"
    class="react-autosuggest__container react-autosuggest__suggestions-container--open"
    role="combobox"
  >
    <input
      aria-autocomplete="list"
      aria-controls="result-list"
      aria-label="IBM search field"
      autocomplete="off"
      class="bx--header__search--input"
      name="q"
      part="search-input"
      placeholder="Search all of IBM"
      type="text"
    >
    <div
      class="react-autosuggest__suggestions-container"
      id="result-list"
    >
      <ul
        class="dds-ce__search__list react-autosuggest__suggestions-list"
        role="listbox"
      >
      </ul>
    </div>
  </div>
</form>
<div
  aria-live="assertive"
  aria-relevant="additions text"
  class="bx--assistive-text"
  role="status"
>
</div>
<div class="bx--header__search--actions">
  <button
    aria-label="perform-search-button-assistive-text-foo"
    class="bx--header__action bx--header__search--search"
    part="open-button"
    type="button"
  >
  </button>
  <button
    aria-label="close-search-button-assistive-text-foo"
    class="bx--header__action bx--header__search--close"
    part="close-button"
    type="button"
  >
  </button>
</div>

```

