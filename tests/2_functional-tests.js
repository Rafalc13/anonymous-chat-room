const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({ text: "test text", delete_password: "test pass" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.text);
        assert.equal(res.body.delete_password);
        assert.equal(res.body.reported);
        done();
      });
  });
  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .get("/api/threads/test")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        assert.isArray(res.body[0].replies);
        assert.isAtMost(res.body[0].replies.length, 3);
        assert.equal(res.body[0].text, "test text");
        done();
      });
  });
  test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({ thread_id: "65991b5744979e486774de83" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text);
        done();
      });
  });
  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({ thread_id: "65991b5744979e486774de83", delete_password: "test pass" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text);
        done();
      });
  });
  test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .put("/api/threads/test")
      .send({ thread_id: "6598e5046afbd470a02b2d24" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
  test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        thread_id: "6598e5046afbd470a02b2d24",
        text: "test reply",
        delete_password: "test pass",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text);
        assert.equal(res.body.delete_password);
        assert.equal(res.body.reported);
        done();
      });
  });

  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .get("/api/replies/test?thread_id=6598e5046afbd470a02b2d24")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.replies);
        assert.equal(res.body.replies.text);
        done();
      });
  });
  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({thread_id: '659926941265eabe65d97fe6', reply_id: "6599269d1265eabe65d97fff"})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.delete_password);
        
        done();
      });
    });
  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({ thread_id: "659926941265eabe65d97fe6", reply_id: "659926e61265eabe65d9800e", delete_password: "test pass" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.delete_password);
        done();
      });
  });
  test('Reporting a reply: PUT request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({ thread_id: "6598e5046afbd470a02b2d24", reply_id: "6598e50a6afbd470a02b2d2d" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
});
