import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

export const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/product/${product._id}`)}
            className="cursor-pointer bg-white shadow-md border-[1px] relative border-neutral-200 rounded p-4 hover:shadow-lg transition-all 
        flex flex-col gap-1 justify-center items-center">
            <div className='w-full flex justify-center items-center '>
                <img
                    src={`http://localhost:4000/${product.image}` || assets.noImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.noImage;
                    }}
                    alt={product.productname || 'Product'}
                    className="w-8/12 aspect-square object-cover rounded p-2"
                />
                {product.quantity <= 5 && (
                    <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Low Stock
                    </div>
                )}
                {product.quantity > 5 && product.quantity <= 10 && (
                    <div className="absolute top-2.5 right-2.5 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded">
                        Limited Stock
                    </div>
                )}
                <p></p>
            </div>

            <div className="flex flex-col justify-start items-start ml-4 w-full">
                <h3 className="text-lg font-semibold mb-1 line-clamp-1 self-center text-center w-full">{product.productname || 'Unnamed Product'}</h3>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-gray-500">Category: {product.category}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                    <span className="text-base text-blue-400 font-bold">
                        {`${product.price} LKR`}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Condition: {product.condition || 'Unknown'}</p>
            </div>
        </div>
    );
}

export const ProductCards = ({ product }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() =>navigate(`/product/${product._id}`)} className="cursor-pointer bg-white shadow-md rounded p-4 hover:shadow-lg transition-all flex justify-start items-start">
            <div>
                <img
                    src={`http://localhost:4000/${product.image}` || assets.noImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.noImage;
                    }}
                    alt={product.productname || 'Product'}
                    className="w-28 h-28 aspect-square object-cover rounded"
                />
            </div>

            <div className="flex flex-col justify-start items-start ml-4 w-full">
                <h3 className="text-lg font-semibold mb-1">{product.productname || 'Unnamed Product'}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description || 'No description available'}</p>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-gray-500">Category: {product.category}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-green-700 font-bold">
                        Price: ${product.price}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Condition: {product.condition || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1">Quantity: {product.quantity}</p>
                {product.guidance && product.guidance !== 'No guidance available' && (
                    <p className="text-xs mt-2 italic text-blue-700">Guidance: {product.guidance}</p>
                )}
            </div>
        </div>
    );
}

export const SearchProductCard = ({ product, onCloseModal ,setSearchTerms}) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => { navigate(`/product/${product._id}`), onCloseModal && onCloseModal()(),setSearchTerms('')}}
            className="cursor-pointer bg-white p-3 border-[1px] border-neutral-100 rounded
         flex justify-start items-start">
            <div>
                <img
                    src={`http://localhost:4000/${product.image}` || assets.noImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.noImage;
                    }}
                    alt={product.productname || 'Product'}
                    className="w-20 h-20 aspect-square p-1 object-cover rounded"
                />
            </div>

            <div className="flex flex-col justify-start items-start ml-4 w-full">

                <h3 className="text-base font-semibold ">{product.productname || 'Unnamed Product'}</h3>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-gray-500">Category: {product.category}</span>
                </div>

                <span className="text-sm text-blue-400 font-bold">
                    Price: ${product.price}
                </span>

            </div>
        </div>
    )
}