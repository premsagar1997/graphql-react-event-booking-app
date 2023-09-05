import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';
import './Bookings.css';

const BookingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    const requestBody = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authContext.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const bookings = resData.data.bookings;
        setBookings(bookings);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const onDeleteBooking = bookingId => {
    setLoading(true);
    const requestBody = {
      query: `
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
          _id
            title
          }
        }
      `,
      variables: {
        id: bookingId
      }
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authContext.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const copiedBookings = [...bookings];
        setBookings(copiedBookings.filter(booking => booking._id !== bookingId));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      {loading && (<Spinner />)}
      {!loading && (
        <Bookings bookings={bookings} onCancel={onDeleteBooking} />
      )}
    </React.Fragment>
  );
}

export default BookingsPage;

const Bookings = ({ bookings, onCancel }) => {
  return (
    <ul className="bookings__list">
      {bookings.map(booking => {
        return (
          <li key={booking._id} className="bookings__item">
            <div className="bookings__item-data">
              {booking.event.title} -{' '}
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            <div className="bookings__item-actions">
              <button className="btn" onClick={() => onCancel(booking._id)}>Cancel</button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
