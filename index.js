import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "book_notes",
	password: "yuganshu_postgres@789",
	port: 5432,
});

db.connect();

var bookData = [];

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function refreshData() {
	db.query("SELECT * FROM book_data ORDER BY id ASC", (err, result) => {
		if (err) {
			console.error("Error executing query", err.stack);
		} else {
			bookData = result.rows;
		}
	});
}

refreshData();

app.get("/", (req, res) => {
	refreshData();
	res.render("pages/index.ejs", { books: bookData });
});

app.get("/isbn", (req, res) => {
	res.render("pages/isbn_entry.ejs");
});

app.post("/isbn", (req, res) => {
	console.log(req.body);
	var isbnNum = req.body["isbn-number"];
	res.redirect(`/add/${isbnNum}`);
});

app.get("/add/:isbnNum", (req, res) => {
	var isbnNum = req.params.isbnNum;
	var requiredBook;

	axios
		.get(
			`https://openlibrary.org/api/books?bibkeys=ISBN:${isbnNum}&format=json&jscmd=data`
		)
		.then(function (response) {
			requiredBook = {
				book_name: response.data[`ISBN:${isbnNum}`]["title"],
				author: response.data[`ISBN:${isbnNum}`]["authors"][0]["name"],
				isbn_number: isbnNum,
				rating: "",
				preview: "",
				notes: "",
			};
			console.log(requiredBook);
			res.render("partials/add_or_edit.ejs", { book: requiredBook, postRoute: `/add/${isbnNum}` });
		})
		.catch(function (error) {
			console.log(error);
			res.redirect("/oops");
		});
});

app.post("/add/:isbnNum", (req, res) => {
	var isbnNum = req.params.isbnNum;
	var bookToAdd = req.body;

	axios
		.get(
			`https://openlibrary.org/api/books?bibkeys=ISBN:${isbnNum}&format=json&jscmd=data`
		)
		.then(function (response) {
			bookToAdd["book_name"] = response.data[`ISBN:${isbnNum}`]["title"];
			bookToAdd["author"] =
				response.data[`ISBN:${isbnNum}`]["authors"][0]["name"];
			bookToAdd["isbn_number"] = isbnNum;

			const d = new Date();
			let year = d.getFullYear();
			let month = d.getMonth() + 1;
			let day = d.getDate();
			bookToAdd["date_added"] = `${year}-${month}-${day}`;

			var lastId = bookData[bookData.length-1].id;

			db.query(
				"INSERT INTO book_data VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				[
					lastId + 1,
					bookToAdd.isbn_number,
					bookToAdd.book_name,
					bookToAdd.author,
					parseFloat(bookToAdd.rating),
					bookToAdd.preview,
					bookToAdd.notes,
					bookToAdd.date_added,
				],
				(err, result) => {
					if (err) {
						console.error("Error executing query", err.stack);
						res.redirect("/oops");
					} else {
						console.log("New book has been added to the database.");
					}
				}
			);

			res.redirect("/");
		})
		.catch(function (error) {
			console.log(error);
			res.redirect("/oops");
		});
});

app.get("/notes/:bookId", (req, res) => {
	let requiredBookId = parseInt(req.params.bookId);
	let requiredBook;
	for (var i = 0; i < bookData.length; i++) {
		if (bookData[i].id === requiredBookId) {
			requiredBook = bookData[i];
		}
	}

	res.render("partials/book_notes.ejs", { book: requiredBook });
});

app.get("/delete/:bookId", (req, res) => {
	var bookToDeleteId = parseInt(req.params.bookId);

	db.query(
		"DELETE FROM book_data WHERE id=$1",
		[bookToDeleteId],
		(err, result) => {
			if (err) {
				console.error("Error executing query", err.stack);
				res.redirect("/oops");
			} else {
				console.log(
					`Book with id: ${bookToDeleteId} has been deleted successfully`
				);
			}
		}
	);

	res.redirect("/");
});

app.get("/edit/:bookId", (req, res) => {
	var bookToEditId = parseInt(req.params.bookId);
	var bookToEdit;
	for (var i = 0; i < bookData.length; i++) {
		if (bookData[i].id === bookToEditId) {
			bookToEdit = bookData[i];
		}
	}
	res.render("partials/add_or_edit.ejs", { book: bookToEdit, postRoute: `/edit/${bookToEditId}` });
});

app.post("/edit/:bookId", (req, res) => {
	var bookToEditId = req.params.bookId;
	var bookToEdit = req.body;

	db.query(
		"UPDATE book_data SET rating=$1, preview=$2, notes=$3 WHERE id=$4",
		[
			parseFloat(bookToEdit["rating"]),
			bookToEdit["preview"],
			bookToEdit["notes"],
			bookToEditId,
		],
		(err, result) => {
			if (err) {
				console.error("Error executing query", err.stack);
				res.redirect("/oops");
			} else {
				console.log(
					`Book with id: ${bookToEditId} has been edited successfully`
				);
				res.redirect("/");
			}
		}
	);
});

app.get("/oops", (req, res) => {
	res.render("pages/oops.ejs");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
