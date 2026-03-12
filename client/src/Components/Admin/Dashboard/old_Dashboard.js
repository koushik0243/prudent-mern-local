'use client';

import React, { useState } from "react";
import Link from "next/link";

const Dashboard = () => {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <div className="col" id="content-wrapper">
                    <div className="category-area dashboard-area">
                        <div className="mb-4">
                            <h2 className="fw-bold" style={{color: "#b6110f", marginBottom: "0px"}}>Dashboard</h2>
                            <p className="text-muted">Welcome to your admin dashboard. Here's an overview of your content.</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading dashboard data...</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {/* {statCards.map((card, index) => (
                                    <div className="col-md-3 col-lg-2" key={index}>
                                        <Link href={card.link} className="text-decoration-none">
                                            <div className={`card h-100`} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <div className="card-body">
                                                    <div className="d-flex1">
                                                        <div>
                                                            <h6 className="card-subtitle mb-3 text-white-100 fw-bold text-center">{card.title}</h6>
                                                            <h2 className="card-title mb-0 fw-bold text-center" style={{color: "#b6110f !important" }}>{card.count}</h2>
                                                        </div>                                                        
                                                    </div>
                                                    <div className="mt-3 text-center">
                                                        <small className="text-white-100">Click to view all</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))} */}
                            </div>
                        )}

                        {/* Additional Stats Section */}
                        {/* {!loading && (
                            <div className="row mt-4">
                                <div className="col-12 q-summery-area">
                                    <h5 className="card-title mb-3">Quick Summary</h5>
                                    <div className="row text-center g-4">
                                        <div className="col-md-3 col-lg-2">
                                            <div class="card">
                                                <div className="card-body">
                                                    <h3 className="text-dark fw-bold mb-1">{photosCount + slidersCount + videosCount}</h3>
                                                    <small className="text-muted">Media Content</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-lg-2">
                                            <div class="card">
                                                <div className="card-body">
                                                    <h3 className="text-dark fw-bold mb-1">{newsUpdatesCount + pageContentCount}</h3>
                                                    <small className="text-muted">News & Content</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-lg-2">
                                            <div class="card">
                                                <div className="card-body">
                                                    <h3 className="text-dark fw-bold mb-1">{sponsorsCount + testimonialsCount}</h3>
                                                    <small className="text-muted">Sponsors & Testimonials</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3 col-lg-2">
                                            <div class="card">
                                                <div className="card-body">
                                                    <h3 className="text-dark fw-bold mb-1">{contactMailsCount}</h3>
                                                    <small className="text-muted">Contact Messages</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>
                
            </div>
        </>
    );
};

export default Dashboard;
