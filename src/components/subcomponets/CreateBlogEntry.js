// CreateBlogEntry.js
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  ProgressBar,
  Row,
  Col,
} from "react-bootstrap";
import { API } from "../../Api";

const api = new API();



/**
 * Block shape (backwards compatible)
 * {
 *   type: "paragraph" | "header" | "subheader" | "image" | "code",
 *   content: string | File | null,   // image = File (editor), becomes "content_image_X" (backend key) on submit
 *   placeholder?: string,
 *   align?: "left" | "center" | "right",
 *   spacing?: "compact" | "normal" | "spacious",
 *   // code-only
 *   language?: string,
 *   // image-only
 *   widthPct?: number, // 25..100
 *   caption?: string
 * }
 */

const CreateBlogEntry = () => {
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [thumbnailFile, setThumbnailFile] = React.useState(null);
  const [thumbnailName, setThumbnailName] = React.useState("");
  const [contentBlocks, setContentBlocks] = React.useState([]);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const LOCAL_STORAGE_KEY = "createBlogEntryData_v3";

  // ---------- helpers ----------
  const updateBlock = (index, patch) => {
    setContentBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const moveBlock = (fromIndex, toIndex) => {
    setContentBlocks((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const deleteBlock = (index) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddContentBlock = (type) => {
    const base = {
      type,
      content: "",
      placeholder: "",
      align: "left",
      spacing: "normal",
    };

    if (type === "image") {
      base.content = null;
      base.widthPct = 80;
      base.caption = "";
    }

    if (type === "code") {
      base.language = "javascript";
    }

    setContentBlocks((prev) => [...prev, base]);
  };

  const handleContentChange = (index, value) => updateBlock(index, { content: value });

  const handleFileChange = (index, file) => {
    if (!file) return;
    updateBlock(index, { content: file, placeholder: file.name });
  };

  // ---------- localStorage draft recovery ----------
  React.useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) return;

    try {
      const parsed = JSON.parse(savedData);
      setTitle(parsed.title || "");
      setSummary(parsed.summary || "");
      setAuthor(parsed.author || "");
      setContentBlocks(parsed.contentBlocks || []);
      setThumbnailName(parsed.thumbnailName || "");
      alert("Recovered your unsaved blog post data. Please re-upload any images.");
    } catch (e) {
      console.warn("Failed to parse saved draft:", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const serializableBlocks = contentBlocks.map((b) => {
        if (b.type === "image") {
          return {
            ...b,
            content: null, // cannot serialize File
            placeholder:
              b.placeholder || (b.content instanceof File ? b.content.name : ""),
          };
        }
        return b;
      });

      const dataToSave = {
        title,
        summary,
        author,
        contentBlocks: serializableBlocks,
        thumbnailName,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }, 10000);

    return () => clearInterval(interval);
  }, [title, summary, author, contentBlocks, thumbnailName]);

  // ---------- validation ----------
  const validateBeforeSubmit = () => {
    if (!title.trim()) return "Please enter a title.";
    if (!summary.trim()) return "Please enter a summary.";
    if (!author.trim()) return "Please enter an author.";
    if (!thumbnailFile) return "Please upload a thumbnail image.";

    for (let i = 0; i < contentBlocks.length; i++) {
      const b = contentBlocks[i];

      if (b.type === "header" || b.type === "subheader") {
        if (!String(b.content || "").trim()) return `Block ${i + 1}: text is required.`;
      }

      if (b.type === "paragraph") {
        // basic "empty quill" guard
        const s = String(b.content || "").replace(/<(.|\n)*?>/g, "").trim();
        if (!s) return `Block ${i + 1}: paragraph is empty.`;
      }

      if (b.type === "code") {
        if (!String(b.content || "").trim()) return `Block ${i + 1}: code is empty.`;
        if (!b.language) return `Block ${i + 1}: please select a language.`;
      }

      if (b.type === "image") {
        if (!(b.content instanceof File)) {
          return `Block ${i + 1}: image file missing (re-upload required).`;
        }
        const w = Number(b.widthPct ?? 80);
        if (Number.isNaN(w) || w < 25 || w > 100) {
          return `Block ${i + 1}: image width must be between 25 and 100.`;
        }
      }
    }

    return "";
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("author", author);

    // thumbnail
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    // Build content JSON. For each image block:
    // - attach file to formData as content_image_{index}
    // - set block.content to that string key
    const contentData = contentBlocks.map((block, index) => {
      const align = block.align || "left";
      const spacing = block.spacing || "normal";

      if (block.type === "image" && block.content instanceof File) {
        const fileKey = `content_image_${index}`;
        formData.append(fileKey, block.content);

        return {
          ...block,
          align,
          spacing,
          widthPct: Number(block.widthPct ?? 80),
          caption: block.caption || "",
          placeholder: block.content.name,
          content: fileKey,
        };
      }

      if (block.type === "code") {
        return {
          ...block,
          align,
          spacing,
          language: block.language || "javascript",
          content: block.content, // plain text
        };
      }

      // paragraph/header/subheader
      return {
        ...block,
        align,
        spacing,
      };
    });

    formData.append("content", JSON.stringify(contentData));

    try {
      await api.pushNewEntry(formData, (percentCompleted) => {
        setUploadProgress(percentCompleted);
      });

      setShowSuccess(true);

      // reset
      setTitle("");
      setSummary("");
      setAuthor("");
      setThumbnailFile(null);
      setThumbnailName("");
      setContentBlocks([]);
      setUploadProgress(0);

      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Error creating blog entry:", error);
      setErrorMessage("An error occurred while creating the blog entry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Create Blog Entry</h2>

      {showSuccess && (
        <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
          Blog entry created successfully!
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}

      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" variant="primary" />
          <div>Submitting...</div>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="my-3" />
      )}

      <Form onSubmit={handleSubmit}>
        {/* Title */}
        <Form.Group controlId="formTitle" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        {/* Summary */}
        <Form.Group controlId="formSummary" className="mb-3">
          <Form.Label>Summary</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter a short summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </Form.Group>

        {/* Author */}
        <Form.Group controlId="formAuthor" className="mb-3">
          <Form.Label>Author</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </Form.Group>

        {/* Thumbnail */}
        <Form.Group controlId="formThumbnail" className="mb-3">
          <Form.Label>Thumbnail Image</Form.Label>

          {thumbnailName && !thumbnailFile && (
            <p className="text-muted">
              Recovered draft: please re-upload thumbnail: {thumbnailName}
            </p>
          )}
          {thumbnailFile && <p className="text-muted">Selected file: {thumbnailFile.name}</p>}

          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setThumbnailFile(file);
              setThumbnailName(file.name);
            }}
            required
          />
        </Form.Group>

        {/* Content Blocks */}
        <h4>Content Blocks</h4>

        {contentBlocks.map((block, index) => (
          <div key={index} className="mb-4 p-3 border rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-bold">
                Block {index + 1} - {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </div>

              {/* Reorder + delete */}
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveBlock(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  type="button"
                  disabled={index === contentBlocks.length - 1}
                  onClick={() => moveBlock(index, index + 1)}
                >
                  ↓
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  type="button"
                  onClick={() => deleteBlock(index)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Layout controls */}
            <Row className="g-2 mb-3">
              <Col xs={12} md={4}>
                <Form.Select
                  value={block.align || "left"}
                  onChange={(e) => updateBlock(index, { align: e.target.value })}
                >
                  <option value="left">Align: Left</option>
                  <option value="center">Align: Center</option>
                  <option value="right">Align: Right</option>
                </Form.Select>
              </Col>

              <Col xs={12} md={4}>
                <Form.Select
                  value={block.spacing || "normal"}
                  onChange={(e) => updateBlock(index, { spacing: e.target.value })}
                >
                  <option value="compact">Spacing: Compact</option>
                  <option value="normal">Spacing: Normal</option>
                  <option value="spacious">Spacing: Spacious</option>
                </Form.Select>
              </Col>

              {block.type === "image" && (
                <Col xs={12} md={4}>
                  <Form.Control
                    type="number"
                    min={25}
                    max={100}
                    value={block.widthPct ?? 80}
                    onChange={(e) => updateBlock(index, { widthPct: Number(e.target.value) })}
                    placeholder="Width %"
                  />
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Image width % (25–100)
                  </div>
                </Col>
              )}
            </Row>

            {/* Editors */}
            {block.type === "paragraph" && (
              <ReactQuill
                theme="snow"
                value={block.content}
                onChange={(value) => handleContentChange(index, value)}
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ size: [] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "font",
                  "size",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "blockquote",
                  "list",
                  "bullet",
                  "indent",
                  "link",
                  "image",
                ]}
              />
            )}

            {block.type === "header" && (
              <Form.Control
                type="text"
                value={block.content || ""}
                onChange={(e) => handleContentChange(index, e.target.value)}
                required
              />
            )}

            {block.type === "subheader" && (
              <Form.Control
                type="text"
                value={block.content || ""}
                onChange={(e) => handleContentChange(index, e.target.value)}
                required
              />
            )}

            {block.type === "image" && (
              <>
                {block.placeholder && !(block.content instanceof File) && (
                  <p className="text-muted mb-1">
                    Recovered draft: please re-upload image: {block.placeholder}
                  </p>
                )}
                {block.content instanceof File && (
                  <p className="text-muted mb-1">Selected file: {block.content.name}</p>
                )}

                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0])}
                  required
                />

                <Form.Group className="mt-2">
                  <Form.Label>Caption (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Token engine flow diagram"
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(index, { caption: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mt-2">
                  <Form.Label>Width slider</Form.Label>
                  <Form.Range
                    min={25}
                    max={100}
                    value={block.widthPct ?? 80}
                    onChange={(e) => updateBlock(index, { widthPct: Number(e.target.value) })}
                  />
                  <div className="text-muted">Width: {block.widthPct ?? 80}%</div>
                </Form.Group>
              </>
            )}

            {block.type === "code" && (
              <>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Enter your code here"
                  value={block.content}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                  required
                />

                <Form.Select
                  className="mt-2"
                  value={block.language || "javascript"}
                  onChange={(e) => updateBlock(index, { language: e.target.value })}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                  
                </Form.Select>
              </>
            )}
          </div>
        ))}

        {/* Add block buttons */}
        <div className="mb-3">
          <Button variant="secondary" type="button" onClick={() => handleAddContentBlock("paragraph")} className="me-2">
            Add Paragraph
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleAddContentBlock("header")} className="me-2">
            Add Header
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleAddContentBlock("subheader")} className="me-2">
            Add Subheader
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleAddContentBlock("image")} className="me-2">
            Add Image
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleAddContentBlock("code")} className="me-2">
            Add Code Block
          </Button>
        </div>

        <Button variant="primary" type="submit" disabled={isLoading}>
          Publish
        </Button>
      </Form>

      <div className="text-muted mt-4" style={{ fontSize: 12 }}>
        <strong>Backend payload:</strong> FormData with title/summary/author/thumbnail + JSON "content" + per-image files keyed as <code>content_image_#</code>.
      </div>
    </Container>
  );
};

export default CreateBlogEntry;
