// BlogPage.js
import React, { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Container, Form, Button, Card } from "react-bootstrap";
import { API } from "../../Api";
import { useParams } from "react-router-dom";

const api = new API();

const spacingToStyle = (spacing) => {
  switch (spacing) {
    case "compact":
      return { marginTop: 8, marginBottom: 8 };
    case "spacious":
      return { marginTop: 24, marginBottom: 24 };
    case "normal":
    default:
      return { marginTop: 16, marginBottom: 16 };
  }
};

const justifyForAlign = (align) => {
  switch (align) {
    case "center":
      return "center";
    case "right":
      return "flex-end";
    case "left":
    default:
      return "flex-start";
  }
};

const textAlignForAlign = (align) => {
  switch (align) {
    case "center":
      return "center";
    case "right":
      return "right";
    case "left":
    default:
      return "left";
  }
};

const BlogPage = () => {
  const { id } = useParams();
  const [blogEntry, setBlogEntry] = useState(null);
  const [newComment, setNewComment] = useState({ author: "", comment: "" });
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const initFetch = async () => {
      try {
        const entry = await api.getBlogEntry(id);
        const e = entry?.[0];

        // Safety: if DB returns JSON string sometimes
        if (e && typeof e.content === "string") {
          try {
            e.content = JSON.parse(e.content);
          } catch {}
        }

        setBlogEntry(e);
        setComments(e?.comments || []);
      } catch (err) {
        console.error("Error fetching blog entry:", err);
      }
    };
    initFetch();
  }, [id]);

  if (!blogEntry) return <div>Loading...</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBlock = (block, index) => {
    const align = block?.align || "left";

    switch (block.type) {
      case "header":
        return (
          <h2 key={index} style={{ margin: 0, textAlign: textAlignForAlign(align) }}>
            {block.content}
          </h2>
        );

      case "subheader":
        return (
          <h3 key={index} style={{ margin: 0, textAlign: textAlignForAlign(align) }}>
            {block.content}
          </h3>
        );

      case "paragraph":
        return (
          <div
            key={index}
            style={{ margin: 0, textAlign: textAlignForAlign(align) }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );

      case "image": {
        if (!block.content) return null;

        const widthPct = Number(block.widthPct ?? 80);
        const safeWidth = Number.isFinite(widthPct)
          ? Math.min(100, Math.max(25, widthPct))
          : 80;

        const caption = block.caption || "";
        const mime = block.mimetype || "image/jpeg";

        return (
          <div key={index} style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: justifyForAlign(align) }}>
              <img
                src={`data:${mime};base64,${block.content}`}
                alt={caption || `Image ${index + 1}`}
                style={{
                  width: `${safeWidth}%`,
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 8,
                }}
                className="img-fluid"
              />
            </div>

            {caption ? (
              <div
                className="text-muted"
                style={{
                  marginTop: 8,
                  textAlign: textAlignForAlign(align),
                  fontSize: "0.95rem",
                }}
              >
                {caption}
              </div>
            ) : null}
          </div>
        );
      }

      case "code":
        return (
          <div key={index} style={{ width: "100%" }}>
            <Highlight
              theme={themes.nightOwl}
              code={block.content || ""}
              language={block.language || "javascript"}
            >
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={className}
                  style={{ ...style, padding: "20px", overflowX: "auto", margin: 0 }}
                >
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        );

      default:
        return null;
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.author || !newComment.comment) {
      setError("Please provide both an author and comment.");
      return;
    }

    const dummyComment = {
      author: newComment.author,
      comment: newComment.comment,
      date: new Date().toISOString(),
    };

    setComments((prev) => [...prev, dummyComment]);

    try {
      await api.pushComment(id, newComment.comment, newComment.author);
      setNewComment({ author: "", comment: "" });
      setError("");
    } catch (err) {
      setComments((prev) => prev.filter((c) => c !== dummyComment));
      setError("Failed to add comment.");
    }
  };

  const renderComments = () => {
    return comments
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((comment, index) => (
        <Card key={index} className="mb-3">
          <Card.Body>
            <Card.Title>{comment.author}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {formatDate(comment.date)}
            </Card.Subtitle>
            <Card.Text>{comment.comment}</Card.Text>
          </Card.Body>
        </Card>
      ));
  };

  return (
    <Container className="mt-4" style={{ paddingBottom: "50px" }}>
      <h1>{blogEntry.title}</h1>
      <p className="text-muted">
        By {blogEntry.author} | {formatDate(blogEntry.entry_date)}
      </p>
      <hr />

      {/* Content blocks */}
      <div>
        {(blogEntry.content || []).map((block, index) => {
          const spacingStyle = spacingToStyle(block.spacing);
          const align = block?.align || "left";

          return (
            <div
              key={index}
              style={{
                ...spacingStyle,
                display: "flex",
                justifyContent: justifyForAlign(align),
                width: "100%",
              }}
            >
              {/* keep inner at full width; actual alignment handled by justifyContent + textAlign */}
              <div style={{ width: "100%" }}>{renderBlock(block, index)}</div>
            </div>
          );
        })}
      </div>

      <hr className="mt-5 mb-5" />

      {/* Comment Section */}
      <div className="comment-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          renderComments()
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        <Form onSubmit={handleAddComment} className="mt-4">

          <Form.Group controlId="formAuthor">
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={newComment.author}
              onChange={(e) =>
                setNewComment({ ...newComment, author: e.target.value })
              }
              
            />

          </Form.Group>

          <Form.Group controlId="formComment" className="mt-2">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write your comment"
              value={newComment.comment}
              onChange={(e) =>
                setNewComment({ ...newComment, comment: e.target.value })
              }
            />
          </Form.Group>

          {error && <p className="text-danger mt-2">{error}</p>}

          <Button variant="primary" type="submit" className="mt-2">
            Add Comment
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default BlogPage;
