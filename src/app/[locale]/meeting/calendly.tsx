"use client";

import { InlineWidget } from "react-calendly";
import { motion } from "framer-motion";
import { PiArrowLeft, PiCalendar } from "react-icons/pi";
import Link from "next/link";

const CalendlyScheduling = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lochmara-50 to-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <PiCalendar className="text-3xl text-lochmara-500" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Schedule Your Strategy Call
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let&apos;s discuss your project in detail and create a customized plan to
            achieve your goals.
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Link
            href="/meeting "
            className="inline-flex items-center gap-2 text-lochmara-600 hover:text-lochmara-700 transition-colors"
          >
            <PiArrowLeft />
            Back to AI Form
          </Link>
        </motion.div>

        {/* Calendly Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <InlineWidget
            styles={{ height: "700px" }}
            url="https://calendly.com/houssemdaas2/30min"
          />
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="text-center space-y-2">
            <p className="text-gray-600 mb-4">Having trouble? Contact us directly</p>
            <a
              href="mailto:contact@navixagency.tech"
              className="inline-block px-4 py-2 bg-lochmara-500 text-white rounded-lg hover:bg-lochmara-600 transition-colors mr-4"
            >
              Email us directly: contact@navixagency.tech
            </a>
            <span className="hidden sm:block text-gray-400">•</span>
            <a
              href="tel:50699724"
              className="text-lochmara-600 hover:text-lochmara-700 font-medium"
            >
              Call us: (+216) 50 699 724
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalendlyScheduling;