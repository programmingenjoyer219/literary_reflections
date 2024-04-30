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
	port: 5432
});

db.connect();

var bookData = [];

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

function refreshData(){
	db.query("SELECT * FROM book_data", (err, result) => {
		if (err) {
			console.error("Error executing query", err.stack);
		}else {
			bookData = result.rows;			
		}
	});
}

refreshData();

app.get("/", (req, res) => {
	refreshData();
	res.render("pages/index.ejs", {books: bookData});
});

app.get("/isbn", (req, res) => {
	res.render("pages/isbn_entry.ejs");
});

app.get("/add", (req, res) => {
	res.render("partials/add_or_edit.ejs")
});

app.get("/notes/:bookId", (req, res) => {
	let requiredBookId = parseInt(req.params.bookId);
	let requiredBook = {};
	for (var i=0; i<bookData.length; i++){
		if (bookData[i].id === requiredBookId){
			requiredBook = bookData[i];
		}
	}

	res.render("partials/book_notes.ejs", {book: requiredBook});
});

app.get("/delete/:bookId", (req, res) => {
	var bookToDeleteId = parseInt(req.params.bookId);
	db.query("DELETE FROM book_data WHERE id=$1", [bookToDeleteId], (err, result) => {
		if (err) {
			console.error("Error executing query", err.stack);
		}else {
			console.log(`Book with id: ${bookToDeleteId} has been deleted successfully`);
		}
	});

	res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});