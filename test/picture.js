const { chai, server, should } = require("./testConfig");
const PictureModel = require("../models/PictureModel");

/**
 * Test cases to test all the picture APIs
 * Covered Routes:
 * (1) Login
 * (2) Store picture
 * (3) Get all pictures
 * (4) Get single picture
 * (5) Update picture
 * (6) Delete picture
 */

describe("Picture", () => {
	//Before each test we empty the database
	before((done) => {
		PictureModel.deleteMany({}, (err) => {
			done();
		});
	});

	// Prepare data for testing
	const userTestData = {
		"password":"Test@123",
		"email":"zee@azmat.com"
	};

	// Prepare data for testing
	const testData = {
		"name":"testing picture name",
		"cloudinaryId":"testing picture cloudinary Id",
		"link":"testing picture link",
		"user": "123123"
	};

	/*
  * Test the /POST route
  */
	describe("/POST Login", () => {
		it("it should do user Login for picture", (done) => {
			chai.request(server)
				.post("/api/auth/login")
				.send({"email": userTestData.email,"password": userTestData.password})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Login Success.");
					userTestData.token = res.body.data.token;
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST picture Store", () => {
		it("It should send validation error for store picture", (done) => {
			chai.request(server)
				.post("/api/picture")
				.send()
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST picture Store", () => {
		it("It should store picture", (done) => {
			chai.request(server)
				.post("/api/picture")
				.send(testData)
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("picture add Success.");
					done();
				});
		});
	});

	/*
  * Test the /GET route
  */
	describe("/GET All picture", () => {
		it("it should GET all the pictures", (done) => {
			chai.request(server)
				.get("/api/picture")
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Operation success");
					testData._id = res.body.data[0]._id;
					done();
				});
		});
	});

	/*
  * Test the /GET/:id route
  */
	describe("/GET/:id picture", () => {
		it("it should GET the pictures", (done) => {
			chai.request(server)
				.get("/api/picture/"+testData._id)
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Operation success");
					done();
				});
		});
	});

	/*
  * Test the /PUT/:id route
  */
	describe("/PUT/:id picture", () => {
		it("it should PUT the pictures", (done) => {
			chai.request(server)
				.put("/api/picture/"+testData._id)
				.send(testData)
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("picture update Success.");
					done();
				});
		});
	});

	/*
  * Test the /DELETE/:id route
  */
	describe("/DELETE/:id picture", () => {
		it("it should DELETE the pictures", (done) => {
			chai.request(server)
				.delete("/api/picture/"+testData._id)
				.set("Authorization", "Bearer "+ userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("picture delete Success.");
					done();
				});
		});
	});
});