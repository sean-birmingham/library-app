async function init() {
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("close-button");
  const addBtn = document.getElementById("add-button");
  const clearBtn = document.getElementById("clear-button");
  const form = document.getElementById("book-form");
  const formTitle = document.getElementById("form-title");
  const titleInput = document.getElementById("title-input");
  const authorInput = document.getElementById("author-input");
  const coverInput = document.getElementById("cover-input");
  const isReadCheckbox = document.getElementById("is-read-checkbox");
  const submitBtn = document.getElementById("submit-button");
  const bookList = document.getElementById("book-list");
  const searchBar = document.getElementById("search-bar");

  let isUpdating = false;
  let bookToUpdateId;

  // Book class to store book information
  class Book {
    constructor(id, title, author, cover, isRead = false) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.cover = cover;
      this.isRead = isRead;
    }
  }

  // Library class to manage the books
  class Library {
    constructor() {
      this.books = JSON.parse(localStorage.getItem("myLibrary")) || [];
    }

    // add a new book to the library
    addBook(book) {
      this.books.push(book);
      this.save();
    }

    editBook(id, bookUpdates) {
      const bookIndex = this.books.findIndex((book) => book.id === id);
      Object.assign(this.books[bookIndex], bookUpdates);
      this.save();
    }

    // Remove a book from the library
    removeBook(id) {
      const index = this.books.findIndex((book) => book.id === id);
      this.books.splice(index, 1);
      this.save();
    }

    // search for books
    searchBooks(query) {
      const filteredBooks = this.books.filter((book) => {
        const titleMatch = book.title
          .toLowerCase()
          .includes(query.toLowerCase());

        const authorMatch = book.author
          .toLowerCase()
          .includes(query.toLowerCase());

        return titleMatch || authorMatch;
      });

      return filteredBooks;
    }

    save() {
      localStorage.setItem("myLibrary", JSON.stringify(this.books));
      this.render();
    }

    clear() {
      this.books = [];
      localStorage.removeItem("myLibrary");
      this.render();
    }

    createBookCard(book) {
      const bookCard = document.createElement("article");
      bookCard.setAttribute("role", "listitem");
      bookCard.classList.add(
        "bg-white",
        "rounded-lg",
        "shadow-lg",
        "overflow-hidden",
        "relative"
      );

      const bookImg = document.createElement("img");
      bookImg.src = book.cover;
      bookImg.alt = `${book.title} cover image`;
      bookImg.classList.add("w-full", "h-48", "object-cover");

      bookCard.appendChild(bookImg);

      const bookDetails = document.createElement("div");
      bookDetails.classList.add("p-4");
      bookCard.appendChild(bookDetails);

      const bookTitle = document.createElement("h2");
      bookTitle.classList.add("text-xl", "font-semibold");
      bookTitle.textContent = book.title;
      bookDetails.appendChild(bookTitle);

      const bookAuthor = document.createElement("p");
      bookAuthor.classList.add("text-gray-600");
      bookAuthor.textContent = book.author;
      bookDetails.appendChild(bookAuthor);

      const bookReadStatus = document.createElement("p");

      bookReadStatus.classList.add("read-status");
      book.isRead ? bookReadStatus.classList.add("read") : null;

      bookReadStatus.textContent = book.isRead ? "Read" : "Unread";

      bookDetails.appendChild(bookReadStatus);

      const buttons = document.createElement("div");
      buttons.classList.add(
        "mt-4",
        "flex",
        "flex-col",
        "lg:flex-row",
        "md:flex-wrap",
        "md:justify-end",
        "gap-3"
      );

      bookDetails.appendChild(buttons);

      const bookEditButton = document.createElement("button");
      bookEditButton.classList.add("btn", "btn-primary");
      bookEditButton.textContent = "Edit";
      buttons.appendChild(bookEditButton);

      bookEditButton.addEventListener("click", () => {
        formTitle.textContent = "Edit Book";
        submitBtn.textContent = "Save";

        titleInput.value = book.title;
        authorInput.value = book.author;
        coverInput.value = book.cover;
        isReadCheckbox.checked = book.isRead;

        isUpdating = true;
        bookToUpdateId = book.id;

        modal.classList.add("overlay");
      });

      const bookRemoveButton = document.createElement("button");
      bookRemoveButton.classList.add("btn", "btn-danger");
      bookRemoveButton.textContent = "Remove";
      buttons.appendChild(bookRemoveButton);

      bookRemoveButton.addEventListener("click", () => {
        this.removeBook(book.id);
      });

      return bookCard;
    }

    renderBooks(books) {
      while (bookList.firstChild) {
        bookList.removeChild(bookList.firstChild);
      }

      if (books.length === 0) {
        const message = document.createElement("p");
        message.classList.add("text-xl");
        message.textContent = "No books to display.";
        message.setAttribute("role", "listitem");
        bookList.appendChild(message);
      } else {
        books.forEach((book) => {
          const bookCard = this.createBookCard(book);
          bookList.appendChild(bookCard);
        });
      }
    }

    render(query = "") {
      let filteredBooks = this.books;

      if (query) {
        filteredBooks = this.books.filter((book) => {
          const titleMatch = book.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const authorMatch = book.author
            .toLowerCase()
            .includes(query.toLowerCase());
          return titleMatch || authorMatch;
        });
      }

      this.renderBooks(filteredBooks);
    }
  }

  // Create new library object
  const library = new Library();

  addBtn.addEventListener("click", () => {
    formTitle.textContent = "Add Book";
    submitBtn.textContent = "Add Book";
    modal.classList.add("overlay");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("overlay");
    form.reset();
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your library?")) {
      library.clear();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get the form data
    const id = isUpdating ? bookToUpdateId : Date.now().toString();
    const title = titleInput.value;
    const author = authorInput.value;
    const cover = coverInput.value;
    const isRead = isReadCheckbox.checked;

    // Create or update the book
    if (isUpdating) {
      library.editBook(id, { title, author, cover, isRead });
    } else {
      const book = new Book(id, title, author, cover, isRead);
      library.addBook(book);
    }

    // Reset the form and modal
    form.reset();
    modal.classList.remove("overlay");
    isUpdating = false;
  });

  searchBar.addEventListener("input", (e) => {
    const query = searchBar.value.trim();
    library.render(query);
  });

  library.render();
}

window.addEventListener("load", init);
