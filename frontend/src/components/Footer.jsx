import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className='bg-gray-400'>
      <div className="max-w-6xl mx-auto p-7">
        <div className="flex justify-between flex-wrap">
          {/* Left Section */}
          <div className="mb-6 md:mb-0">
            <h2 className='font-bold text-lg'>Fit-gain</h2>
            <p className="text-sm max-w-xs mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc 
              maximus, nulla ut commodo sagittis, sapien dui mattis dui, non 
              pulvinar lorem felis nec erat
            </p>
          </div>
          
          {/* Middle Section - Company Links */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-2">Company</h3>
            <ul className="text-sm">
              <li className="mb-1"><Link to="/">Home</Link></li>
              <li className="mb-1"><Link to="/about">About us</Link></li>
              <li className="mb-1"><Link to="/delivery">Delivery</Link></li>
              <li className="mb-1"><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          
          {/* Right Section - Contact Info */}
          <div>
            <h3 className="font-semibold mb-2">Contact us</h3>
            <ul className="text-sm">
              <li className="mb-1 flex items-center">
                <span className="mr-2">📞</span> +91 9876567578
              </li>
              <li className="mb-1 flex items-center">
                <span className="mr-2">✉️</span> info@example.com
              </li>
              <li className="mb-1 flex items-center">
                <span className="mr-2">📍</span> Lorem ipsum dolor sit amet
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-gray-400 mt-6 pt-4 flex justify-between items-center text-sm">
          <p>Copyright © 2024 Website. All rights reserved.</p>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  )
}