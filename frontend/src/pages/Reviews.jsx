import React from "react";

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../context/StoreContext";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState("");
    const { serverURL } = useContext(StoreContext);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${serverURL}/api/review/all-reviews`);
                if (!response.data.success) throw new Error(response.data.message || "Failed to fetch reviews");
                setReviews(response.data.data);
            } catch (err) {
                setError(err.message || "Failed to load reviews");
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="w-full min-h-svh">
            <div className="container h-full mx-auto px-2 md:px-0">
                <div className="w-lg h-full flex flex-col mx-auto justify-start items-start gap-2">
                    <h1 className="text-xl font-bold text-neutral-800 my-5">Our Reviews</h1>
                    <div className="w-lg bg-white flex flex-col gap-4 justify-start items-start">
                        {error && <p className="text-red-500 p-4">{error}</p>}
                        {reviews.length === 0 && !error ? (
                            <p className="text-neutral-600 p-4">No reviews yet</p>
                        ) : (
                            reviews.map(review => (
                                <div
                                    key={review._id}
                                    className="w-full flex flex-col gap-2 justify-start items-start border-b border-b-neutral-400 hover:bg-neutral-100 p-4 duration-300 cursor-pointer"
                                >
                                    <p className="text-lg italic font-semibold text-neutral-800">{`"${review.content}"`}</p>
                                    <div className="w-full flex flex-col justify-start items-start">
                                        <p className="text-base font-semibold text-neutral-700">
                                            {review.userId.name}
                                        </p>
                                        <p className="text-sm font-normal text-neutral-600">
                                            {new Date(review.dateTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reviews;