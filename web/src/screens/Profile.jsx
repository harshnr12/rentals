import { useContext } from 'react';
import UserDataContext from '../context/UserDataContext.js';
import './Profile.css';

function Profile() {
    const { currentUser, favoriteIds } = useContext(UserDataContext);

    if (!currentUser) {
        return (
            <main className="profile-page">
                <p>Loading profile...</p>
            </main>
        );
    }

    const memberSince = new Date(currentUser.created_at).toLocaleDateString(
        undefined, { month: 'long', day: 'numeric', year: 'numeric' }
    );
    const savedCount = favoriteIds ? favoriteIds.size : 0;
    const lifetimeContacts = currentUser.lifetime_contacted_property_count || 0;

    return (
        <main className="profile-page">
            <div className="profile-card">
                <header className="profile-header">
                    <div className="profile-avatar">
                        <svg viewBox="0 0 24 24" className="profile-avatar-icon" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <div className="profile-title-group">
                        <h2>{currentUser.name}</h2>
                        <p>Member since: {memberSince}</p>
                    </div>
                </header>

                <h3 className="profile-section-title">Contact Information</h3>
                <div className="profile-details-row">
                    <div className="profile-field">
                        <div className="profile-field-label">Email Address</div>
                        <div className="profile-field-value">{currentUser.email}</div>
                    </div>
                    <div className="profile-field">
                        <div className="profile-field-label">Phone Number</div>
                        <div className="profile-field-value">{currentUser.phone}</div>
                    </div>
                </div>

                <h3 className="profile-section-title">Platform Activity</h3>
                <div className="profile-metrics-row">
                    <div className="metric-card">
                        <span className="metric-number">{savedCount}</span>
                        <span className="metric-label">Saved Properties</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-number">{lifetimeContacts}</span>
                        <span className="metric-label">Lifetime Inquiries Sent</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Profile;