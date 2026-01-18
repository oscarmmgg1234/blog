// AdminModal.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { API } from "../Api";
import { setAdminAuth } from "../auth/adminAuth"; // adjust path

const api = new API();

const AdminModal = ({ onClose }) => {
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.verifyAdminKey(password);

      if (response.success && response.token && response.expiresAt) {
        setAdminAuth({ token: response.token, expiresAt: response.expiresAt });

        onClose();
        navigate("/admin");
      } else {
        setErrorMessage(response.message || "Incorrect password");
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) setErrorMessage("Too many attempts. Try again later.");
      else setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Admin Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="adminPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>

          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
              {errorMessage}
            </Alert>
          )}

          <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AdminModal;
