import React from 'react';

function LiveStream({ events }) {
    return (
        <div className="livestream-container">
            <h3 className="section-title">
                ⚡ Live Data Stream
                <span className="stream-badge">Kinesis → Lambda</span>
            </h3>
            <div className="livestream-feed">
                {events.length === 0 ? (
                    <div className="stream-empty">
                        <span className="pulse-dot"></span>
                        Waiting for incoming data...
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="stream-event fade-in">
                            <span className="event-time">{event.time}</span>
                            <span className="event-city">{event.city}</span>
                            <span className="event-data">
                                {event.temp}°C · {event.weather}
                            </span>
                            <span className="event-badge">✓ Processed</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default LiveStream;
