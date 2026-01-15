import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PropTypes from 'prop-types';

export default function PaginationComponent({ count, page, onChange }) {
    return (
        <div className="flex justify-center pb-[20px] pt-[30px]">
            <Stack spacing={2}>
                <Pagination
                    count={count}
                    page={page}
                    onChange={onChange}
                    sx={{
                        "& .MuiPaginationItem-root.Mui-selected": {
                            background: "linear-gradient(to right, #4a2fcf, #6440F5)",
                            color: "#fff",
                        },
                    }}
                />
            </Stack>
        </div>
    );
}

PaginationComponent.propTypes = {
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};
