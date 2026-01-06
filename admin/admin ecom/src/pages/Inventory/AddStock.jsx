import Select from '@mui/material/Select';
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import {
    Box,
    IconButton,
    Popover,
    TextField,
    MenuItem,
} from "@mui/material";
import { CircularProgress } from "@mui/material";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { BsPlusSquare } from "react-icons/bs";
import axios from 'axios';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { HiOutlinePlus } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import {
    DndContext,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    closestCenter,
} from "@dnd-kit/core";
import { HiOutlineTrash } from "react-icons/hi2";
import { BiRefresh } from "react-icons/bi";
import { IoMdInformationCircle } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";


import {
    SortableContext,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";


export default function AddStock() {
    return (
        <>
            <div className="py-[10px] px-[100px]">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Nhập thêm hàng
                    </h3>
                </div>
            </div>
        </>
    )
}

