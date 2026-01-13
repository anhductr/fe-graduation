import { useEffect, useState } from "react";
import { Button, Modal, Input, message, Pagination } from "antd";
import { api } from "../libs/axios";

export default function AddressManager() {
    const [addresses, setAddresses] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [viewingAddress, setViewingAddress] = useState(null); // xem chi tiết

    // form state
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [street, setStreet] = useState("");

    // address select
    const [province, setProvince] = useState(null);
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // pagination
    const [page, setPage] = useState(1);
    const pageSize = 5;

    /* ================= API ================= */

    const fetchAddresses = async () => {
        try {
            const res = await api.get("/user-service/users/myInfo");
            setAddresses(res.data.result.address || []);
        } catch (err) {
            console.error(err);
            message.error("Không tải được danh sách địa chỉ");
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // load provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(setProvinces)
            .catch(err => console.error(err));
    }, []);

    // load districts khi chọn province
    useEffect(() => {
        if (!province) return;
        fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setDistricts(data.districts || []);
                setDistrict(null);
                setWard(null);
                setWards([]);
            });
    }, [province]);

    // load wards khi chọn district
    useEffect(() => {
        if (!district) return;
        fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setWards(data.wards || []);
                setWard(null);
            });
    }, [district]);

    const resetForm = () => {
        setReceiverName("");
        setReceiverPhone("");
        setAddressLine("");
        setStreet("");
        setProvince(null);
        setDistrict(null);
        setWard(null);
        setDistricts([]);
        setWards([]);
        setEditing(null);
    };

    const openCreate = () => {
        resetForm();
        setOpen(true);
    };

    const openEdit = (addr) => {
        setEditing(addr);
        setReceiverName(addr.receiverName);
        setReceiverPhone(addr.receiverPhone);
        setAddressLine(addr.addressLine);
        setStreet(addr.street);

        // prefill province/district/ward
        const p = provinces.find(pv => pv.name === addr.city);
        setProvince(p || null);

        if (p && addr.district) {
            fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    setDistricts(data.districts || []);
                    const d = data.districts.find(d => d.name === addr.district);
                    setDistrict(d || null);

                    if (d && addr.ward) {
                        fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
                            .then(res => res.json())
                            .then(data => {
                                setWards(data.wards || []);
                                const w = data.wards.find(w => w.name === addr.ward);
                                setWard(w || null);
                            });
                    }
                });
        }

        setOpen(true);
    };

    const submit = async () => {
        if (!receiverName || !receiverPhone || !province || !district || !ward) {
            message.warning("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const payload = {
            receiverName,
            receiverPhone,
            addressLine,
            street,
            ward: ward?.name,
            district: district?.name,
            city: province?.name,
        };

        try {
            if (editing) {
                await api.put(`/profile-service/address/${editing.id}`, payload);
                message.success("Cập nhật địa chỉ thành công");
            } else {
                await api.post("/profile-service/address", payload);
                message.success("Thêm địa chỉ thành công");
            }

            setOpen(false);
            resetForm();
            fetchAddresses();
        } catch (err) {
            console.error(err);
            message.error("Có lỗi xảy ra");
        }
    };

    const handlePageChange = (p) => setPage(p);

    return (
        <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Địa chỉ của tôi</h2>
                <Button type="primary" onClick={openCreate}>
                    Thêm địa chỉ
                </Button>
            </div>

            {addresses.length === 0 && (
                <div className="text-gray-500 text-center py-6">
                    Chưa có địa chỉ nào
                </div>
            )}

            <div className="space-y-3">
                {addresses
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map(addr => (
                        <div
                            key={addr.id}
                            className="border rounded p-4 flex justify-between items-center cursor-pointer"
                        >
                            <div
                                className="flex-1"
                                onClick={() => setViewingAddress(addr)}
                            >
                                <div className="font-medium">
                                    {addr.receiverName} – {addr.receiverPhone}
                                </div>
                                <div className="text-gray-600">
                                    {addr.addressLine}, {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                                </div>
                            </div>
                            <Button onClick={() => openEdit(addr)}>Chỉnh sửa</Button>
                        </div>
                    ))}
            </div>

            {addresses.length > pageSize && (
                <div className="flex justify-center mt-4">
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={addresses.length}
                        onChange={handlePageChange}
                    />
                </div>
            )}

            {/* Modal thêm/chỉnh sửa */}
            <Modal
                title={editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
                open={open}
                centered
                onOk={submit}
                onCancel={() => setOpen(false)}
                okText="Lưu"
                cancelText="Huỷ"
                width={700}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        placeholder="Tên người nhận"
                        value={receiverName}
                        onChange={e => setReceiverName(e.target.value)}
                    />
                    <Input
                        placeholder="Số điện thoại"
                        value={receiverPhone}
                        onChange={e => setReceiverPhone(e.target.value)}
                    />
                    <Input
                        placeholder="Số nhà / địa chỉ cụ thể"
                        value={addressLine}
                        onChange={e => setAddressLine(e.target.value)}
                    />
                    <Input
                        placeholder="Tên đường"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                    />

                    {/* Tỉnh */}
                    <select
                        value={province?.code ?? ""}
                        onChange={(e) => {
                            const code = Number(e.target.value);
                            const selected = provinces.find(p => p.code === code);
                            setProvince(selected);
                            setDistrict(null);
                            setWard(null);
                            setDistricts([]);
                            setWards([]);
                        }}
                        className="input-field"
                    >
                        <option value="">Chọn Tỉnh / Thành phố</option>
                        {provinces.map(p => (
                            <option key={p.code} value={p.code}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    {/* Huyện */}
                    <select
                        value={district?.code ?? ""}
                        onChange={(e) => {
                            const code = Number(e.target.value);
                            const selected = districts.find(d => d.code === code);
                            setDistrict(selected);
                            setWard(null);
                            setWards([]);
                        }}
                        disabled={!districts.length}
                        className="input-field"
                    >
                        <option value="">Chọn Quận / Huyện</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    {/* Xã */}
                    <select
                        value={ward?.code ?? ""}
                        onChange={(e) => {
                            const code = Number(e.target.value);
                            const selected = wards.find(w => w.code === code);
                            setWard(selected);
                        }}
                        disabled={!wards.length}
                        className="input-field"
                    >
                        <option value="">Chọn Phường / Xã</option>
                        {wards.map(w => (
                            <option key={w.code} value={w.code}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </div>
            </Modal>

            {/* Modal xem chi tiết */}
            <Modal
                title="Chi tiết địa chỉ"
                open={!!viewingAddress}
                centered
                onOk={() => setViewingAddress(null)}
                onCancel={() => setViewingAddress(null)}
                okText="Đóng"
                cancelText="Huỷ"
                width={600}
                bodyStyle={{ padding: '24px' }}
            >
                {viewingAddress && (
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Tên người nhận</span>
                            <span>{viewingAddress.receiverName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Số điện thoại</span>
                            <span>{viewingAddress.receiverPhone}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Số nhà / địa chỉ cụ thể</span>
                            <span>{viewingAddress.addressLine}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Tên đường</span>
                            <span>{viewingAddress.street}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Xã</span>
                            <span>{viewingAddress.ward}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 mb-1">Huyện</span>
                            <span>{viewingAddress.district}</span>
                        </div>

                        <div className="flex flex-col col-span-2">
                            <span className="font-semibold text-gray-900 mb-1">Tỉnh / Thành phố</span>
                            <span>{viewingAddress.city}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
