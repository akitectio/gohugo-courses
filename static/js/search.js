document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-query");

    // Event listener for input changes
    searchInput.addEventListener("input", () => {
        var recentPosts = document.getElementById('recent-posts');

        console.log(searchInput.value.length);
        if (searchInput.value.length > 0) {
            recentPosts.style.display = 'none';
        } else {
            recentPosts.style.display = 'block';
        }

        const searchQuery = searchInput.value.trim(); // Get the trimmed input value
        if (searchQuery) {
            executeSearch(searchQuery);
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
        const response = await fetch("index.json");
        const pages = await response.json();
        const fuse = new Fuse(pages, fuseOptions);
        const result = fuse.search(searchQuery);
        console.log({ "matches": result });
        if (result.length > 0) {
            populateResults(result);
        } else if (searchQuery.length > 0) {
            document.getElementById('search-results').innerHTML = "<p>No matches found</p>";
        } else {
            document.getElementById('search-results').innerHTML = "";
        }
    } catch (error) {
        console.error("Error fetching index.json:", error);
    }
}

function populateResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous results
    var searchQuery = document.getElementById('search-query').value;
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

        console.log({ "item": item, "matches": matches, "snippet": snippet, "snippetHighlights": snippetHighlights });
        const resultElement = document.createElement('div');
        resultElement.className = 'col-md-3';
        resultElement.innerHTML = `
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <a href="${item.permalink}">
                    <img src="${item.featuredImage}" class="card-img-top-home" alt="${item.title}">
                </a>
                
                <h5 class="card-title mt-1">
                    <a class="link-a" href="${item.permalink}">
                        <span class="highlighted-title">${item.title.replace(new RegExp(searchQuery, 'gi'), '<mark style="background-color: red;">$&</mark>')}</span>
                    </a>
                </h5>
                <p class="card-text limited-text">${snippet.replace(new RegExp(searchQuery, 'gi'), '<mark style="background-color: red;">$&</mark>')}</p>
                ${item.tags.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())).map(tag => `<a href="/tags/${tag}"><span class="badge bg-secondary">${tag.replace(new RegExp(searchQuery, 'gi'), '<mark style="background-color: red;">$&</mark>')}</span></a>`).join('')}
            </div>
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
        { name: "courses", weight: 0.3 }
    ]
};

