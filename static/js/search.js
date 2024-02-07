document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-query");

    // Event listener for input changes
    searchInput.addEventListener("input", () => {
        const searchQuery = searchInput.value.trim(); // Get the trimmed input value
        if (searchQuery) {
            executeSearch(searchQuery);
        } else {
            document.getElementById('search-results').innerHTML = "<p>Please enter a word or phrase above</p>";
        }
    });

    // Initialize with query param if present
    const initialQuery = param("s");
    if (initialQuery) {
        searchInput.value = initialQuery;
        executeSearch(initialQuery);
    }
});

async function executeSearch(searchQuery) {
    try {
        const response = await fetch("/index.json");
        const pages = await response.json();
        const fuse = new Fuse(pages, fuseOptions);
        const result = fuse.search(searchQuery);
        console.log({ "matches": result });
        if (result.length > 0) {
            populateResults(result);
        } else {
            document.getElementById('search-results').innerHTML = "<p>No matches found</p>";
        }
    } catch (error) {
        console.error("Error fetching index.json:", error);
    }
}

function populateResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous results

    results.forEach((result, index) => {
        const { item, matches } = result;
        let snippet = '';
        const snippetHighlights = [];

        matches.forEach(match => {
            const { key, indices, value } = match;
            if (key === 'contents') {
                const [startIdx, endIdx] = indices[0];
                const start = Math.max(startIdx - summaryInclude, 0);
                const end = Math.min(endIdx + summaryInclude, item.contents.length);
                snippet += `${item.contents.substring(start, end)}...`;
                snippetHighlights.push(value.substring(startIdx, endIdx + 1));
            }
        });

        if (!snippet) snippet = `${item.contents.substring(0, summaryInclude * 2)}...`;

        const resultElement = document.createElement('div');
        resultElement.innerHTML = `
        <div class="search-result">
          <h2><a href="${item.permalink}">${item.title}</a></h2>
          <p>${snippet}</p>
          <!-- Additional details like tags and categories can be added here -->
        </div>
      `;

        // Highlight the snippet text, if needed
        snippetHighlights.forEach(highlight => {
            resultElement.innerHTML = resultElement.innerHTML.replace(highlight, `<mark>${highlight}</mark>`);
        });

        searchResults.appendChild(resultElement);
    });
}

function param(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

const summaryInclude = 60;
const fuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.0,
    tokenize: true,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        { name: "title", weight: 0.8 },
        { name: "contents", weight: 0.5 },
        { name: "tags", weight: 0.3 },
        { name: "categories", weight: 0.3 }
    ]
};
