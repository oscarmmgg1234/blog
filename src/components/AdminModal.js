import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { API } from "../Api";
import { setAdminAuth } from "../auth/adminAuth";

const api = new API();

const BASE_DELAY_MS = 1000;   // 1s
const MAX_DELAY_MS = 30000;  // 30s

const AdminModal = ({ onClose }) => {
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [attempts, setAttempts] = React.useState(0);
  const [cooldownUntil, setCooldownUntil] = React.useState(0);

  const navigate = useNavigate();

  const now = Date.now();
  const inCooldown = now < cooldownUntil;
  const cooldownSeconds = Math.ceil((cooldownUntil - now) / 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inCooldown) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.verifyAdminKey(password);

      if (response.success && response.token && response.expiresAt) {
        // ✅ success → reset state
        setAttempts(0);
        setCooldownUntil(0);

        setAdminAuth({ token: response.token, expiresAt: response.expiresAt });
        onClose();
        navigate("/admin");
        return;
      }

      throw new Error("Invalid credentials");
    } catch (error) {
      const status = error?.response?.status;

      // increment attempts
      setAttempts((prev) => {
        const next = prev + 1;

        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, next - 1),
          MAX_DELAY_MS
        );

        setCooldownUntil(Date.now() + delay);
        return next;
      });

      if (status === 429) {
        setErrorMessage("Too many attempts. Try again later.");
      } else {
        setErrorMessage("Incorrect password.");
      }
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
              disabled={isSubmitting || inCooldown}
            />
          </Form.Group>

          {errorMessage && (
            <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
              {errorMessage}
            </Alert>
          )}

          {inCooldown && (
            <Alert variant="warning">
              Try again in <strong>{cooldownSeconds}s</strong>
            </Alert>
          )}

          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || inCooldown}
            className="w-100"
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Logging in...
              </>
            ) : inCooldown ? (
              `Locked (${cooldownSeconds}s)`
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
