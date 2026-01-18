import React from "react";
import { HashRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

import Home from "../src/components/Home";
import Portfolio from "../src/components/Portfolio";
import Blog from "../src/components/Blog";
import BlogPage from "./components/subcomponets/BlogPage";
import CreateBlogEntry from "../src/components/subcomponets/CreateBlogEntry";
import AdminModal from "../src/components/AdminModal";

import { isAdminAuthed } from "./auth/adminAuth"; // adjust path

function App() {
  const [showAdminModal, setShowAdminModal] = React.useState(false);

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Oscar's Technical Blog
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/blog">
                Blog
              </Nav.Link>
            </Nav>
            <Button variant="outline-light" onClick={() => setShowAdminModal(true)}>
              Admin
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} />}

      <Container style={{ paddingTop: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPage />} />

          <Route
            path="/admin"
            element={isAdminAuthed() ? <CreateBlogEntry /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
