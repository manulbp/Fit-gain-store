import {
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    TextField
} from '@mui/material';
import axios from 'axios';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchProductCard } from './ProductCard';

const SearchhModal = ({ open, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        setSearchTerm('');
    }, [onClose])

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 3) {
                try {
                    const params = { name: searchTerm };
                    if (category) params.category = category;
                    if (condition) params.condition = condition;

                    const response = await axios.get('http://localhost:4000/api/product/filter', {
                        params
                    });
                    setSearchResults(response.data.products.slice(0, 3) || []);
                } catch (error) {
                    console.error('Error searching products:', error);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, category, condition]);

    return (
        <Modal open={open} onClose={onClose}>
            <div className='absolute bg-gray-200 text-neutral-800 inset-1 md:inset-0 h-fit m-auto w-full md:w-[500px] p-6 rounded-md shadow-md'>
                <div className='flex w-full flex-col gap-4 justify-start items-start'>
                    <div className='w-full flex gap-2 justify-between items-center'>
                        <p className='text-base font-bold'>Search</p>
                        <IconButton onClick={onClose}><X /></IconButton>
                    </div>
                    <div className='w-full flex flex-col gap-4'>
                        <TextField
                            fullWidth
                            label='Search Products'
                            placeholder='Type product name...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: searchTerm && (
                                    <IconButton onClick={() => setSearchTerm('')} size='small'>
                                        <X size={16} />
                                    </IconButton>
                                )
                            }}
                        />
                        <div className='flex gap-2'>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    label='Category'
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <MenuItem value=''>All</MenuItem>
                                    <MenuItem value='Equipment'>Equipment</MenuItem>
                                    <MenuItem value='Supplement'>Supplement</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                    value={condition}
                                    label='Condition'
                                    onChange={(e) => setCondition(e.target.value)}
                                >
                                    <MenuItem value=''>All</MenuItem>
                                    <MenuItem value='Brand New'>Brand New</MenuItem>
                                    <MenuItem value='Secondary'>Secondary</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    <div className='w-full flex flex-col gap-2 justify-start items-start'>
                        {searchResults.length > 0 ? (
                            searchResults.map((product) => (
                                <SearchProductCard key={product._id} product={product} onCloseModal={onClose} />
                            ))
                        ) : (
                            <p className='text-sm text-gray-700'>
                                {searchTerm.length >= 3 ? 'No products found' : 'Type at least 3 letters to search'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SearchhModal;