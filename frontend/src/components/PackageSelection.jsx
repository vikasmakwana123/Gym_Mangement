import React, { useState } from "react";
import "../styles/PackageSelection.css";

const PackageSelection = ({ onPackageSelect, selectedPackage = "basic" }) => {
  const packages = [
    {
      id: "basic",
      name: "Basic",
      subtitle: "Monthly",
      duration: "30 Days",
      price: "₹999",
      pricePerDay: "₹33/day",
      features: [
        "Access to all gym equipment",
        "Basic facilities",
        "Mon-Fri access",
        "1 locker",
      ],
      color: "#3498db",
      popular: false,
    },
    {
      id: "3months",
      name: "3 Months",
      subtitle: "Quarterly",
      duration: "90 Days",
      price: "₹2,799",
      pricePerDay: "₹31/day",
      features: [
        "All Basic features",
        "Weekend access included",
        "2 lockers",
        "Free fitness consultation",
      ],
      color: "#2ecc71",
      popular: false,
    },
    {
      id: "6months",
      name: "6 Months",
      subtitle: "Half Yearly",
      duration: "180 Days",
      price: "₹5,099",
      pricePerDay: "₹28/day",
      features: [
        "All 3-Month features",
        "Priority locker access",
        "Free nutrition plan",
        "Monthly fitness assessment",
      ],
      color: "#e74c3c",
      popular: true,
    },
    {
      id: "fullYear",
      name: "Full Year",
      subtitle: "Annual",
      duration: "365 Days",
      price: "₹8,999",
      pricePerDay: "₹25/day",
      features: [
        "All Premium features",
        "Personal trainer sessions (4/month)",
        "Priority class booking",
        "VIP member benefits",
        "Guest pass (2/month)",
      ],
      color: "#f39c12",
      popular: false,
    },
  ];

  const testPackage = {
    id: "test_3min",
    name: "Test",
    subtitle: "Testing Only",
    duration: "3 Minutes",
    price: "Free",
    pricePerDay: "Testing",
    features: ["Development testing only", "Limited access", "No features"],
    color: "#95a5a6",
    popular: false,
    isTest: true,
  };

  return (
    <div className="package-selection-container">
      <div className="package-header">
        <h2>Choose Your Membership Plan</h2>
        <p>Select the perfect plan that suits your fitness goals</p>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card ${selectedPackage === pkg.id ? "active" : ""} ${
              pkg.popular ? "popular" : ""
            }`}
            onClick={() => onPackageSelect(pkg.id)}
          >
            {pkg.popular && <div className="popular-badge">Most Popular</div>}

            <div className="package-header-section">
              <h3 className="package-name">{pkg.name}</h3>
              <p className="package-subtitle">{pkg.subtitle}</p>
            </div>

            <div className="package-pricing">
              <div className="price">{pkg.price}</div>
              <div className="price-per-day">{pkg.pricePerDay}</div>
              <div className="duration">{pkg.duration}</div>
            </div>

            <div className="package-features">
              <h4>Includes:</h4>
              <ul>
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`select-btn ${selectedPackage === pkg.id ? "selected" : ""}`}
              style={selectedPackage === pkg.id ? { backgroundColor: pkg.color } : {}}
              onClick={() => onPackageSelect(pkg.id)}
            >
              {selectedPackage === pkg.id ? "Selected" : "Select Plan"}
            </button>
          </div>
        ))}

        {}
        <details className="test-package-details" style={{ marginTop: "20px" }}>
          <summary style={{ cursor: "pointer", color: "#666" }}>
            Developer: Show Test Package (3 min)
          </summary>
          <div className="test-package-section" style={{ marginTop: "10px" }}>
            <div
              className={`package-card test-card ${selectedPackage === testPackage.id ? "active" : ""}`}
              onClick={() => onPackageSelect(testPackage.id)}
            >
              <div className="package-header-section">
                <h3 className="package-name">{testPackage.name}</h3>
                <p className="package-subtitle">{testPackage.subtitle}</p>
              </div>

              <div className="package-pricing">
                <div className="price">{testPackage.price}</div>
                <div className="price-per-day">{testPackage.pricePerDay}</div>
                <div className="duration">{testPackage.duration}</div>
              </div>

              <div className="package-features">
                <h4>Usage:</h4>
                <ul>
                  {testPackage.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="checkmark">⚙</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`select-btn ${selectedPackage === testPackage.id ? "selected" : ""}`}
                style={selectedPackage === testPackage.id ? { backgroundColor: testPackage.color } : {}}
                onClick={() => onPackageSelect(testPackage.id)}
              >
                {selectedPackage === testPackage.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default PackageSelection;
