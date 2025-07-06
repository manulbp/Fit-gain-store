import React from "react";
import { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import { UserContext } from "../../context/UserContext";
import { Button, Modal, TextField } from "@mui/material";
import { Plus } from "lucide-react";
import axios from "axios"

const UserReviews = () => {
    const { serverURL } = useContext(StoreContext);
    const { User, authToken } = useContext(UserContext);
    const [openAddReviewModal, setOpenAddReviewModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            if (!User?.user) return;
            try {
                const response = await axios.post(
                    `${serverURL}/api/review/my-reviews`,
                    { userId: User.user.id },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`,
                        },
                    }
                );
                if (!response.data.success) throw new Error(response.data.message || "Failed to fetch reviews");
                setReviews(response.data.data);
            } catch (err) {
                setError(err.message || "Failed to load reviews");
            }
        };
        fetchReviews();
    }, [User, authToken, serverURL]);

    const handleAddReview = async () => {
        if (!content.trim() || !User?.user) return;
        setLoading(true);
        setError("");
        try {
            const response = await axios.post(
                `${serverURL}/api/review/add`,
                { userId: User.user.id, content },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    },
                }
            );
            if (!response.data.success) throw new Error(response.data.message || "Failed to add review");
            setReviews([response.data.data, ...reviews]);
            setContent("");
            setOpenAddReviewModal(false);
        } catch (err) {
            setError(err.message || "Failed to add review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full h-full">
                <div className="w-full flex flex-col gap-4 justify-start items-start">
                    <div className="w-full flex flex-col gap-4 justify-start items-start">
                        <div className="w-full flex justify-between items-center mt-2">
                            <h1 className="font-bold text-xl text-neutral-800">My Reviews</h1>
                            <Button
                                variant="contained"
                                onClick={() => setOpenAddReviewModal(true)}
                                className={`!bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !text-sm`}
                                startIcon={<Plus strokeWidth={1.8} className="text-white" />}
                            >
                                Add Review
                            </Button>
                        </div>
                    </div>
                    <div className="w-lg bg-white flex flex-col gap-4 justify-start items-start">
                        {error && <p className="text-red-500 p-4">{error}</p>}
                        {reviews.length === 0 ? (
                            <p className="text-neutral-600 p-4">No reviews yet</p>
                        ) : (
                            reviews.map(review => (
                                <div
                                    key={review._id}
                                    className="w-full flex flex-col gap-2 justify-start items-start border-b border-b-neutral-400 hover:bg-neutral-100 p-4 duration-300 cursor-pointer"
                                >
                                    <p className="text-lg italic font-semibold text-neutral-800">{` "${review.content}" `}</p>
                                    <p className="text-sm font-normal text-neutral-600">
                                        {new Date(review.dateTime).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Modal
                open={openAddReviewModal}
                onClose={() => setOpenAddReviewModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="fixed inset-0 rounded-md p-5 bg-white w-sm h-fit mx-auto my-auto">
                    <div className="w-full flex flex-col justify-start items-start gap-4">
                        <p className="font-bold text-lg text-neutral-800 mb-4">Add Review</p>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <TextField
                            id="outlined-basic"
                            label="Your Review"
                            variant="outlined"
                            fullWidth
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddReview}
                            disabled={loading}
                            className={`!w-full !p-3 !bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !text-base`}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default UserReviews;