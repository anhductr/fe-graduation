import { useRef, useState, useEffect, useMemo } from "react";
import SearchBar from "../../components/common/SearchBar";
import Boxes from "../../components/common/Boxes";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit, MdOutlineCategory } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { CiBoxList, CiCircleRemove, CiCircleCheck } from "react-icons/ci";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../libs/axios.js";

export default function CateList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const inputSearchRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);
  const [popup, setPopup] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    severity: "info",
    message: "",
  });
  const { vertical, horizontal, open } = popup;

  // Modal states
  const [openConfirmCate, setOpenConfirmCate] = useState(false);
  const [selectedCateId, setSelectedCateId] = useState(null);
  const [openConfirmBrand, setOpenConfirmBrand] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // API helpers
  const fetchCates = async () => {
    const res = await api.get("/product-service/category/getAll");
    const categories = res.data?.result || [];

    const categoriesWithMedia = await Promise.all(
      categories.map(async (category) => {
        try {
          const mediaRes = await api.get(
            "/media-service/media/product/get-media",
            {
              params: {
                ownerId: category.id,
                mediaOwnerType: "CATEGORY",
              },
            }
          );

          const mediaList = mediaRes.data?.result.mediaResponseList || [];
          const thumbnail = mediaList.length > 0 ? mediaList[0].url : null;
          return {
            ...category,
            thumbnail,
            mediaResponse: mediaList,
          };
        } catch (error) {
          console.error(
            `Error fetching media for category ${category.id}:`,
            error
          );
          return {
            ...category,
            thumbnail: null,
            mediaResponse: [],
          };
        }
      })
    );

    return categoriesWithMedia;
  };

  const fetchBrand = async () => {
    const res = await api.get("/product-service/brand/get-all");
    return res.data?.result || [];
  };

  const deleteCate = async (cateId) => {
    const res = await api.delete(`/product-service/category/delete/${cateId}`);
    return res.data;
  };

  const deleteBrand = async (brandName) => {
    const res = await api.delete(`/product-service/brand/delete/${brandName}`);
    return res.data;
  };

  // Build hierarchical tree structure from flat category list
  const buildTree = (list = []) => {
    const map = {};

    // Create map of all items with empty children arrays
    list.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    // Build parent-child relationships
    list.forEach((item) => {
      const node = map[item.id];

      // Use childrenId array if available
      if (Array.isArray(item.childrenId) && item.childrenId.length > 0) {
        item.childrenId.forEach((childId) => {
          if (map[childId]) {
            node.children.push(map[childId]);
          }
        });
      }

      // Also link via parentId (fallback or additional linking)
      if (
        item.parentId !== null &&
        item.parentId !== undefined &&
        map[item.parentId]
      ) {
        const parent = map[item.parentId];
        // Avoid duplicates
        if (!parent.children.find((child) => child.id === item.id)) {
          parent.children.push(node);
        }
      }
    });

    // Return root categories (those with parentId === null)
    return list
      .filter((item) => item.parentId === null || item.parentId === undefined)
      .map((item) => map[item.id]);
  };

  // Queries
  const {
    data: cateData,
    isLoading: isLoadingCate,
    isError: isErrorCate,
    error: errorCate,
  } = useQuery({
    queryKey: ["categories"],
    queryKey: ["categories"],
    queryFn: fetchCates,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  const {
    data: brandData,
    isLoading: isLoadingBrand,
    isError: isErrorBrand,
    error: errorBrand,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrand,
    queryKey: ["brands"],
    queryFn: fetchBrand,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  // Process data
  const cates = useMemo(
    () => (Array.isArray(cateData) ? cateData : []),
    [cateData]
  );
  const treeData = useMemo(() => buildTree(cates), [cates]);
  const brands = useMemo(
    () => (Array.isArray(brandData) ? brandData : []),
    [brandData]
  );

  const [searchTerm, setSearchTerm] = useState("");

  // Recursive search filter
  const filterTree = (nodes, term) => {
    if (!term) return nodes;
    return nodes.reduce((acc, node) => {
      const matches = node.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = node.children
        ? filterTree(node.children, term)
        : [];

      if (matches || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
      return acc;
    }, []);
  };

  const filteredTreeData = useMemo(
    () => filterTree(treeData, searchTerm),
    [treeData, searchTerm]
  );

  // Create category ID to name mapping (optimized with useMemo)
  const categoryMap = useMemo(() => {
    const map = {};
    cates.forEach((cate) => {
      map[cate.id] = cate.name;
    });
    return map;
  }, [cates]);

  // Handle popup from navigation state
  useEffect(() => {
    if (location.state?.popup) {
      const safePopup = {
        vertical: "top",
        horizontal: "center",
        severity: location.state.popup.severity || "info", // ← đảm bảo luôn có
        message: location.state.popup.message || "",
        open: true,
      };

      const timer = setTimeout(() => {
        setPopup(safePopup);
      }, 100);

      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Handle loading and error states
  useEffect(() => {
    if (isLoadingCate) {
      setPopup({
        open: true,
        vertical: "top",
        horizontal: "center",
        severity: "info",
        message: "Đang tải danh sách thể loại...",
      });
    } else if (isErrorCate) {
      console.error("Lỗi khi tải thể loại:", errorCate);
      setPopup({
        open: true,
        severity: "error",
        message: errorCate?.message || "Lỗi khi tải danh mục",
        vertical: "top",
        horizontal: "center",
      });
    } else {
      setPopup((prev) => ({ ...prev, open: false }));
    }
  }, [isLoadingCate, isErrorCate, errorCate]);

  // Mutations
  const deleteCateMutation = useMutation({
    mutationFn: deleteCate,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["categories"]);
      setPopup({
        open: true,
        severity: "success",
        message: "Xóa thể loại thành công!",
        vertical: "top",
        horizontal: "center",
      });
    },
    onError: (err) => {
      console.error("Lỗi khi xóa thể loại:", err);
      setPopup({
        open: true,
        message: err.response?.data?.message || "Xóa thất bại!",
        severity: "error",
        vertical: "top",
        horizontal: "center",
      });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["brands"]);
      setPopup({
        open: true,
        severity: "success",
        message: "Xóa thương hiệu thành công!",
        vertical: "top",
        horizontal: "center",
      });
    },
    onError: (err) => {
      console.error("Lỗi khi xóa thương hiệu:", err);
      setPopup({
        open: true,
        message: err.response?.data?.message || "Xóa thất bại!",
        severity: "error",
        vertical: "top",
        horizontal: "center",
      });
    },
  });

  // Category delete handlers
  const handleDeleteClickCate = (cateId) => {
    setSelectedCateId(cateId);
    setOpenConfirmCate(true);
  };

  const handleConfirmDeleteCate = () => {
    if (selectedCateId) {
      deleteCateMutation.mutate(selectedCateId);
    }
    setOpenConfirmCate(false);
    setSelectedCateId(null);
  };

  const handleCancelDeleteCate = () => {
    setOpenConfirmCate(false);
    setSelectedCateId(null);
  };

  // Brand delete handlers
  const handleDeleteBrandClick = (brandName) => {
    setSelectedBrand(brandName);
    setOpenConfirmBrand(true);
  };

  const handleConfirmDeleteBrand = () => {
    if (selectedBrand) {
      deleteBrandMutation.mutate(selectedBrand);
    }
    setOpenConfirmBrand(false);
    setSelectedBrand(null);
  };

  const handleCancelDeleteBrand = () => {
    setOpenConfirmBrand(false);
    setSelectedBrand(null);
  };

  // Recursive row component for hierarchical display
  function Row({ row, level = 0 }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow key={row.id} hover>
          <TableCell sx={{ pl: level * 3 + 2, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="span"
                sx={{ display: "inline-block", width: 36, textAlign: "center" }}
              >
                {row.children && row.children.length > 0 ? (
                  <IconButton size="small" onClick={() => setOpen(!open)}>
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                ) : null}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span style={{ fontWeight: 500 }}>{row.name}</span>
                {row.special && (
                  <Chip
                    label="Đặc biệt"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                )}
              </Box>
            </Box>
          </TableCell>
          <TableCell align="center">
            {row.thumbnail ? (
              <img
                src={row.thumbnail}
                alt="thumbnail"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <span style={{ color: "#999", fontSize: "0.875rem" }}>
                Không có ảnh
              </span>
            )}
          </TableCell>
          <TableCell>
            <span style={{ color: "#666", fontSize: "0.9rem" }}>
              {row.description || (
                <em style={{ color: "#999" }}>Chưa có mô tả</em>
              )}
            </span>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
              <Link to={`/categories/categories-edit/${row.id}`}>
                <IconButton size="small" color="primary">
                  <MdEdit />
                </IconButton>
              </Link>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClickCate(row.id)}
              >
                <MdDelete />
              </IconButton>
            </Box>
          </TableCell>
        </TableRow>

        {row.children &&
          open &&
          row.children.map((child) => (
            <Row key={child.id} row={child} level={level + 1} />
          ))}
      </>
    );
  }

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          key={vertical + horizontal}
          autoHideDuration={3000}
          onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            severity={popup.severity || "info"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {popup.message}
          </Alert>
        </Snackbar>
        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Quản lý danh mục
          </h3>
        </div>

        <div className="flex flex-wrap gap-[26px] w-full">
          <Boxes
            color="#81bcfaff"
            header={`Tổng danh mục: ${cates.length}`}
            icon={<MdOutlineCategory />}
          />
          <Boxes
            color="#dd92f4ff"
            header={`Danh mục cha: ${cates.filter((c) => c.parentId == null).length
              }`}
            icon={<CiBoxList />}
          />
        </div>

        <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tabs danh mục và thương hiệu"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": {
                backgroundColor: "#4a2fcf",
              },
            }}
          >
            <Tab
              label="Danh sách thể loại"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "18px",
                "&.Mui-selected": {
                  color: "#4a2fcf",
                },
              }}
            />
            <Tab
              label="Quản lý thương hiệu"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "18px",
                "&.Mui-selected": {
                  color: "#4a2fcf",
                },
              }}
            />
          </Tabs>
          {tabValue === 0 && (
            <>
              {/* search bar + filter */}
              <div
                className="py-5 relative flex"
                onClick={(e) => {
                  if (
                    inputSearchRef.current &&
                    e.target !== inputSearchRef.current
                  ) {
                    inputSearchRef.current.blur(); // click ngoài -> blur input
                  }
                }}
              >
                <div className="flex gap-2 w-full">
                  <SearchBar
                    ref={inputSearchRef}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                    component={Link}
                    to="/categories/categories-upload"
                  >
                    <FaPlus className="mr-1" />
                    <span className="ml-1">Thêm thể loại mới</span>
                  </Button>
                </div>
              </div>
              {/* table */}
              <div className="">
                <TableContainer
                  component={Paper}
                  sx={{
                    borderTop: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    borderLeft: "1px solid #e0e0e0",
                  }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableRow>
                        <TableCell sx={{ width: "40%", fontWeight: 600 }}>
                          Tên thể loại
                        </TableCell>
                        <TableCell sx={{ width: "15%" }} align="center">
                          Ảnh
                        </TableCell>
                        <TableCell sx={{ width: "30%" }}>Mô tả</TableCell>
                        <TableCell sx={{ width: "15%" }} align="center">
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTreeData.map((row) => (
                        <Row key={row.id} row={row} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </>
          )}

          {tabValue === 1 && (
            <>
              {/* search bar + filter */}
              <div
                className="py-5 relative flex"
                onClick={(e) => {
                  if (
                    inputSearchRef.current &&
                    e.target !== inputSearchRef.current
                  ) {
                    inputSearchRef.current.blur(); // click ngoài -> blur input
                  }
                }}
              >
                <SearchBar ref={inputSearchRef} />

                <Button
                  variant="contained"
                  className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                  component={Link}
                  to="/categories/brand-upload"
                >
                  <FaPlus className="mr-1" />
                  <span className="ml-1">Thêm thương hiệu mới</span>
                </Button>
              </div>

              <TableContainer
                component={Paper}
                sx={{
                  borderTop: "1px solid #e0e0e0",
                  borderRight: "1px solid #e0e0e0",
                  borderLeft: "1px solid #e0e0e0",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ width: "30%" }}>
                        Tên thương hiệu
                      </TableCell>
                      <TableCell sx={{ width: "50%" }}>
                        Danh sách thể loại liên kết
                      </TableCell>
                      <TableCell sx={{ width: "20%" }} align="center">
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {brands.map((brand, index) => (
                      <TableRow key={index}>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell>
                          {brand.categoryId && brand.categoryId.length > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {brand.categoryId.map((catId) => {
                                const catName =
                                  categoryMap[catId] ||
                                  `ID: ${catId} (không tìm thấy)`;
                                return (
                                  <Chip
                                    key={catId}
                                    label={catName}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <span style={{ color: "#999" }}>
                              Chưa liên kết thể loại nào
                            </span>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigate("/categories/brand-edit", {
                                state: { brand },
                                replace: false,
                              });
                            }}
                          >
                            <MdEdit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBrandClick(brand.name)}
                            color="error"
                          >
                            <MdDelete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </div>
      </div>
      {/* Modal xác nhận xoá */}
      <Dialog open={openConfirmCate} onClose={handleCancelDeleteCate}>
        <DialogTitle>Bạn có chắc chắn muốn xoá thể loại này không?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelDeleteCate} color="inherit">
            Không
          </Button>
          <Button
            onClick={handleConfirmDeleteCate}
            color="error"
            variant="contained"
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmBrand} onClose={handleCancelDeleteBrand}>
        <DialogTitle>
          Bạn có chắc chắn muốn xoá thương hiệu này không?
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelDeleteBrand} color="inherit">
            Không
          </Button>
          <Button
            onClick={handleConfirmDeleteBrand}
            color="error"
            variant="contained"
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
