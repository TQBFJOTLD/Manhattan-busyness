import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './Community.module.css';

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { refreshToken } from '../components/refreshToken';



const Community = () => {
    const [sharedItineraries, setSharedItineraries] = useState([]);
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const comparedUserId = JSON.parse(localStorage.getItem('userId'))
    const local = `${process.env.REACT_APP_API_URL}`;
    const time = [["10:00-12:00","13:00-14:00","20:00-21:00"],["10:00-12:00","13:00-15:00","16:00-19:00","20:00-21:00"],["10:00-12:00","13:00-14:00","15:00-17:00","18:00-20:00","21:00-22:00"],["9:00-11:00","12:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"],["9:00-10:00","11:00-12:00","13:00-14:00","15:00-16:00","17:00-18:00","19:00-20:00","21:00-22:00"]];
    const midPoint = Math.floor(length / 2);


    const fetchSharedItineraries = useCallback(async () => {
        const token = localStorage.getItem('access');
        axios.get(`${process.env.REACT_APP_API_URL}/api/community_itinerary/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                setSharedItineraries(response.data);
                console.log(sharedItineraries);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(fetchSharedItineraries);
                } else {
                    console.log(error);
                }
            });
    }, []);

    useEffect(() => {
        fetchSharedItineraries();
    }, [fetchSharedItineraries]);

    const handleJoin = async (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.post(`${process.env.REACT_APP_API_URL}/api/community_itinerary/${itineraryId}/join/`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Joined the itinerary successfully!");
                axios.get(`${process.env.REACT_APP_API_URL}/api/community_itinerary/`)
                    .then(response => {
                        setSharedItineraries(response.data);
                    });
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleJoin(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleDelete = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`${process.env.REACT_APP_API_URL}/api/itinerary/${itineraryId}/share/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Deleted the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleDelete(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    const handleExit = (itineraryId) => {
        const token = localStorage.getItem('access');
        axios.delete(`${process.env.REACT_APP_API_URL}/api/community_itinerary/${itineraryId}/exit/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Exited the itinerary successfully!");
                fetchSharedItineraries();
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    refreshToken(() => handleExit(itineraryId));
                } else {
                    console.log(error);
                }
            });
    }

    

    return (
        <div className={styles.communityContainer}>
            {/* <Header /> */}
            <h1 className={styles.header}>Community</h1>
            {sharedItineraries.map((itinerary, index) => (
                <div key={index} className={styles.itinerary} >
                    <img className={styles.backgroundimg} src={local + itinerary.itinerary.morning_attractions[0].image}></img>
                    <h3 className={styles.title}>Created by {itinerary.user.first_name + " " + itinerary.user.last_name}<br/>
                        (Joined by {itinerary.joined_users.length} users)
                        {itinerary.user.id === comparedUserId
                            ? <button className={styles.deleteButton} onClick={() => handleDelete(itinerary.id)}>Delete</button>
                            : itinerary.joined_users.includes(comparedUserId)
                                ? <button className={styles.exitButton} onClick={() => handleExit(itinerary.id)}>Exit</button>
                                : <button className={styles.joinButton} onClick={() => handleJoin(itinerary.id)}>Join</button>
                        }
                    
                    </h3>
                    {length = (itinerary.itinerary.morning_attractions.length+itinerary.itinerary.afternoon_attractions.length-1)}
                    <div className={styles.attractionSection}>
                       <b><p className={styles.sectiondate}>Date of travelling:</p></b>
                        <p className={styles.sectiondate}>{itinerary.itinerary.saved_date}</p>
                    </div>
                    <div className={styles.attractionSection}>
                        <h3 className={styles.sectiondate}>Morning Attractions:</h3>
                        {itinerary.itinerary.morning_attractions?.map((attraction, index) => (
                            <div>
                                <li className={styles.sectiondate} key={index}>{attraction.name}</li>
                                <li className={styles.time}>{time[length][index]}</li>
                            </div>
                        ))}
                    </div>
                    
                    <div className={styles.attractionSection}>
                        <h3 className={styles.sectiondate}>Lunch Restaurant:</h3>
                        <p className={styles.sectiondate}>{itinerary.itinerary.lunch_restaurant?.name}</p>
                        <p className={styles.time}>{time[length][midPoint]}</p>
                    </div>

                    <div className={styles.attractionSection}>
                        <h3 className={styles.sectiondate}>Afternoon Attractions:</h3>
                        {itinerary.itinerary.afternoon_attractions?.map((attraction, index) => (
                            <div>
                            <li className={styles.sectiondate} key={index}>{attraction.name}</li>
                            <p className={styles.time}>{time[length][index+midPoint+1]}</p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.attractionSection}>
                        <h3 className={styles.sectiondate}>Dinner Restaurant:</h3>
                        <p className={styles.sectiondate}>{itinerary.itinerary.dinner_restaurant?.name}</p>
                        <p className={styles.time}>{time[length][length+2]}</p>
                    </div>

                </div>
            ))}
            <div className='nav-box'>
                <Navigation onLocationChange={() => { }} />
            </div>
        </div>
    );
};

export default Community;