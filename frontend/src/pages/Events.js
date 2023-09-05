import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/auth-context';
import './Events.css'
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import Events from '../components/Events/Events';
import Spinner from '../components/Spinner/Spinner';

const EventsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);

  const titleElRef = useRef();
  const priceElRef = useRef();
  const dateElRef = useRef();
  const descriptionElRef = useRef();

  useEffect(() => {
    fetchEvents();
  }, []);

  const onShowModal = () => {
    setIsModalOpen(true);
  };

  const onHideModal = () => {
    setIsModalOpen(false);
  };

  const onAddEvent = () => {
    setIsModalOpen(false);
    const title = titleElRef.current?.value;
    const price = +priceElRef.current?.value;
    const date = dateElRef.current?.value;
    const description = descriptionElRef.current?.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    // console.log({ title, price, date, description });
    const requestBody = {
      query: `
        mutation CreateEvent($title: String!, $desc: String!, $price: Float!, $date: String!) {
          createEvent(eventInput: { title: $title, description: $desc, price: $price, date: $date }) {
            _id
            title
            description
            date
            price
          }
        }
      `,
      variables: {
        title: title,
        desc: description,
        price: price,
        date: date,
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
        const event = resData.data.createEvent;
        const copiedEvents = [...events];
        copiedEvents.push({
          ...event,
          creator: {
            _id: authContext.userId
          }
        });
        setEvents(copiedEvents);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const fetchEvents = () => {
    setLoading(true);
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            date
            price
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        setEvents(events);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const onBookEvent = async eventId => {
    if (!authContext.token) return;

    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: eventId
      }
    };

    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + authContext.token
        }
      });
      await response.json();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <React.Fragment>
      {isModalOpen && (
        <React.Fragment>
          <Backdrop />
          <Modal
            title='Add Event'
            canCancel
            canConfirm
            onCancel={onHideModal}
            onConfirm={onAddEvent}
          >
            <form>
              <div className='form-control'>
                <label htmlFor='title'>Title</label>
                <input type='text' id='title' ref={titleElRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='price'>Price</label>
                <input type='number' id='price' ref={priceElRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='date'>Date</label>
                <input type='datetime-local' id='date' ref={dateElRef} />
              </div>
              <div className='form-control'>
                <label htmlFor='description'>Description</label>
                <textarea id='description' rows={4} ref={descriptionElRef} />
              </div>
            </form>
          </Modal>
        </React.Fragment>
      )}

      {authContext.token && (
        <div className='event-control'>
          <p>Share your own events!</p>
          <button className='btn' onClick={onShowModal}>Create Event</button>
        </div>
      )}

      {loading && <Spinner />}
      <Events
        events={events}
        authUserId={authContext.userId}
        onBookEvent={onBookEvent}
      />
    </React.Fragment>
  );
}

export default EventsPage;
