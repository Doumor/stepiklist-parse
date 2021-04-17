const jsdom = require("jsdom") // HTML parser
const { JSDOM } = jsdom

const axios = require('axios'); // Requiest lib

const fs = require('fs');

if (!fs.existsSync('./data'){
    fs.mkdirSync('./data');
}

let fscourses = fs.createWriteStream('data/sert+free') // Write streams

let fcourses = fs.createWriteStream('data/free')

let scourses = fs.createWriteStream('data/sert')

let tcourses = fs.createWriteStream('data/nosert+nonfree')


function logfc(data) { // Functions to write data to file
	fscourses.write(data);
}

function logf(data) {
	fcourses.write(data);
}

function logc(data) {
	scourses.write(data);
}

function logtrash(data) {
	tcourses.write(data);
}



function getcourse(courseid){ // Get course function
	var courseinfo = {} // Just information about course

	courseinfo.id = courseid

	courseinfo.url = "https://stepik.org" + '/course/' + courseid + '/promo' // Add url

	if(courseid % 1000 == 0){
		console.log(courseid);
	}

	axios.get(courseinfo.url)
		.catch(error => {
			// console.log(error);
		})
	  .then(response => {
			if(response){
				if(response.data){
					courseinfo.alive = true
				}
				else {
					courseinfo.alive = false
				} // Is it course exists?
			}

			if(courseinfo.alive == true){
				var dom = new JSDOM(response.data)

				if(typeof dom.window.document.getElementsByClassName("diploma_icon")[0] == "object"){
					courseinfo.certificate = true
				}
				else {
					courseinfo.certificate = false
				} // Is it course have certificate?

				if(typeof dom.window.document.getElementsByClassName("course-promo-enrollment__price_free")[0] == "object"){
					courseinfo.isfree = true
				}
				else {
					courseinfo.isfree = false
				} // Is it free course?

				if(typeof dom.window.document.getElementsByClassName("course-promo__header")[0] == "object"){
					courseinfo.name = dom.window.document.getElementsByClassName("course-promo__header")[0].innerHTML
				}
				else {
					courseinfo.name = null
				} // Course name

				if(typeof dom.window.document.getElementsByClassName("course-promo-summary__students")[0] == "object"){
					courseinfo.students = Number(dom.window.document.getElementsByClassName("course-promo-summary__students")[0].innerHTML.replace(/\s\D+/g, "").replace(",",""))
				}
				else {
					courseinfo.students = null
				} // Get students count

				courseinfo.url = courseinfo.url
				var tolog = courseinfo.url + ' | ' + courseinfo.name  + ' | ' + courseinfo.students + '\n'
				if(courseinfo.isfree == true && courseinfo.certificate == true){ // Free courses with certificate
					logfc(tolog)
				}
				else if(courseinfo.certificate == true){ // Courses with certificate
					logc(tolog)
				}
				else if(courseinfo.isfree == true) { // Free courses
					if(courseinfo.students > 50){ // Only "popular"
						logf(tolog)
					}
				}
				else { // Trash
					if(courseinfo.name != null && courseinfo.students > 50){
						logtrash(tolog)
					}
				}
			}
	  });
}

courseid = 1;

interval = setInterval(function(){ // Main loop
	getcourse(courseid);
	if(courseid == 150000){
		clearInterval(interval)
	}
	courseid++;
}, 10);
