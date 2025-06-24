"use client"
import { mockFAQs } from '@/utils/contants'
import React, { useState } from 'react'
import { BiHelpCircle } from 'react-icons/bi'
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import Link from 'next/link'

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 ">
        <div className="text-center mb-12">
          <BiHelpCircle className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our services, bookings, and more.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-gradient-to-b from-blue-200 to-white p-6 sm:p-8 rounded-lg shadow-lg">
          {mockFAQs.length > 0 ? (
            <div className="w-full">
              {mockFAQs.map((faq, index) => (
                <div key={index} className="border-b border-gray-400 last:border-b-0">
                  <div 
                    className="flex justify-between items-center py-4 cursor-pointer"
                    onClick={() => toggleAccordion(index)}
                  >
                    <h3 className="text-left text-lg font-medium text-gray-800">
                      {faq.question}
                    </h3>
                    {openIndex === index ? (
                      <IoMdArrowDropup className="h-6 w-6 text-blue-600" />
                    ) : (
                      <IoMdArrowDropdown className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  {openIndex === index && (
                    <div className="text-gray-600 pt-1 pb-4 text-base">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No FAQs available at the moment. Please check back later.</p>
          )}
        </div>

        <div className="mt-12 text-center">
            <h2 className="text-2xl font-headline font-semibold text-gray-800 mb-3">Can't find an answer?</h2>
            <p className="text-gray-600 mb-6">
                Our support team is ready to help. Please visit our <span className="text-blue-600 hover:underline">Contact Page</span>.
            </p>
        </div>
      </div>
  )
}

export default Faq
