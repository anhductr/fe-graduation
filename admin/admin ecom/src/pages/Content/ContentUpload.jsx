import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { IoArrowBackOutline } from "react-icons/io5";

export default function ContentUpload() {
  const { id } = useParams(); // If id exists, it's Edit mode
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "faq",
    status: "published",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch detail if Edit
  const fetchDetail = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_CONTENT_CHATBOT_API_URL}/content/${id}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return res.data;
  };

  const { data: contentData, isError: isQueryError } = useQuery({
    queryKey: ["content", id],
    queryFn: fetchDetail,
    enabled: isEdit,
  });

  useEffect(() => {
    if (contentData) {
      setFormData({
        title: contentData.title || "",
        content: contentData.content || "",
        category: contentData.category || "faq",
        status: contentData.status || "published",
        tags: contentData.tags || [],
      });
    }
  }, [contentData]);

  useEffect(() => {
    if (isQueryError) {
      setPopup({
        open: true,
        message: "Không lấy được thông tin bài viết",
        severity: "error",
      });
    }
  }, [isQueryError]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newContent) => {
      const token = localStorage.getItem("token");
      return await axios.post(
        `${import.meta.env.VITE_CONTENT_CHATBOT_API_URL}/content`,
        newContent,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contents"]);
      navigate("/contents", {
        state: {
          popup: { message: "Thêm mới thành công!", severity: "success" },
        },
      });
    },
    onError: (err) => {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Thêm mới thất bại",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      return await axios.put(
        `${import.meta.env.VITE_CONTENT_CHATBOT_API_URL}/content/${id}`,
        data,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["contents"]);
      navigate("/contents", {
        state: {
          popup: { message: "Cập nhật thành công!", severity: "success" },
        },
      });
    },
    onError: (err) => {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Cập nhật thất bại",
        severity: "error",
      });
    },
  });

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToDelete),
    });
  };

  const handleSubmit = () => {
    // Validation basic
    if (!formData.title || !formData.content) {
      setPopup({
        open: true,
        message: "Vui lòng nhập Title và Content",
        severity: "warning",
      });
      return;
    }

    // Auto-add pending tag if exists
    let finalTags = [...formData.tags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
      finalTags.push(tagInput.trim());
    }

    const payload = { ...formData, tags: finalTags };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="py-[10px] px-[100px]">
      <Snackbar
        open={popup.open}
        autoHideDuration={3000}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={popup.severity} variant="filled">
          {popup.message}
        </Alert>
      </Snackbar>

      <Button
        onClick={() => navigate("/contents")}
        startIcon={<IoArrowBackOutline />}
        className="!mb-4 !text-gray-600"
      >
        Quay lại
      </Button>

      <div className="bg-white p-6 rounded-[10px] shadow">
        <h2 className="text-2xl font-bold mb-6 text-[#403e57]">
          {isEdit ? "Chỉnh sửa Content" : "Thêm Content mới"}
        </h2>

        <div className="flex flex-col gap-5">
          <TextField
            label="Tiêu đề (Title)"
            variant="outlined"
            fullWidth
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="flex gap-4">
            <FormControl fullWidth>
              <InputLabel>Danh mục (Category)</InputLabel>
              <Select
                value={formData.category}
                label="Danh mục (Category)"
                name="category"
                onChange={handleChange}
              >
                <MenuItem value="faq">FAQ</MenuItem>
                <MenuItem value="policy">Policy</MenuItem>
                <MenuItem value="guide">Guide</MenuItem>
                <MenuItem value="blog">Blog</MenuItem>
                <MenuItem value="cskh">CSKH</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Trạng thái (Status)</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái (Status)"
                name="status"
                onChange={handleChange}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </div>

          <TextField
            label="Nội dung (Content)"
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />

          <div>
            <TextField
              label="Tags (Nhấn Enter để thêm)"
              variant="outlined"
              fullWidth
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Ví dụ: chatbot, hướng dẫn..."
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </div>
          </div>

          <Button
            variant="contained"
            className="!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !py-3 !mt-4 !text-white !font-bold"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </div>
    </div>
  );
}
