LITERARY REFLECTIONS

	This is a book-notes app. I made this as a part of the web dev course I am enrolled in. You can add short summary for the books you have read using their ISBN number.

	You can also edit/delete a particular review, sort the reviews by latest, best or title. You can use the search bar to search for a specific review by searching the title/
	author or the exact ISBN number.

Database Description:

	Name: book_notes

	Table Name: book_data

	SQL for table creation:

		CREATE TABLE book_data(
	 	id SERIAL PRIMARY KEY,
	 	isbn_number TEXT,
		book_name TEXT,
	 	author TEXT,
		rating FLOAT,
	 	preview TEXT,
		notes TEXT,
	 	date_added DATE
	 	);

Use the following lines of code in your terminal to run the web-app:

	npm i

	nodemon index.js

Troubleshooting

	Sometimes, the changes you make to the website may not be visible immediately. Try refreshing or hard refreshing the website.

	To hard refresh, hold the shift key and click on the refresh button of your browser.

Feel free to modify this project. Happy coding :)
