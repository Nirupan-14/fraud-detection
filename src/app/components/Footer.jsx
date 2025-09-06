import React from "react";
import { Lock, Shield, CheckCircle } from "lucide-react";

const Footer = () => {
  return (
    <div className=" bg-white shadow-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <Lock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Homomorphic Encryption</h3>
          <p className="text-sm text-gray-600 mt-1">
            CKKS scheme with TenSEAL library for secure computation
          </p>
        </div>
        <div>
          <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">Privacy Preserved</h3>
          <p className="text-sm text-gray-600 mt-1">
            Data remains encrypted throughout the entire process
          </p>
        </div>
        <div>
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900">GDPR Compliant</h3>
          <p className="text-sm text-gray-600 mt-1">
            Meets international data protection standards
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
