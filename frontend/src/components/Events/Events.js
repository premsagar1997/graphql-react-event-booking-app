import React from 'react';
import './Events.css';

const Events = ({ events, authUserId, onBookEvent }) => {
  return (
    <ul className='event__list'>
      {events.map(event => (
        <EventItem
          key={event._id}
          event={event}
          authUserId={authUserId}
          onBookEvent={() => onBookEvent(event?._id)}
        />
      ))}
    </ul>
  );
};

export default Events;

const EventItem = ({ event, authUserId, onBookEvent }) => (
  <li className="events__list-item">
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>
        ${event.price} - {new Date(event.date).toLocaleDateString()}
      </h2>
      {(event?.creator?._id === authUserId) ? (
        <span className='creator-btn'>Creator</span>
      ) : (
        <button className="btn" onClick={onBookEvent}>
          Book
        </button>
      )}
    </div>
  </li>
);
