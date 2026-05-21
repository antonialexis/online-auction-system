export const getAuctioneerId = (sellerId) => {
  if (!sellerId) return 'AUC-PENDING';
  return `AUC-${sellerId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};

export const isVerifiedUser = (user) =>
  user?.is_verified === true && user?.verification_status === 'approved';

export const getVerificationMessage = (user) => {
  if (user?.verification_status === 'rejected') {
    return 'Your ID verification was rejected. Please contact admin support before bidding or selling.';
  }

  return 'Pending admin Verification, Please wait for 24 hours.';
};

export const getAuctionBadges = (item) => {
  if (!item) return [];

  if (item.status && item.status !== 'active') {
    return [
      {
        key: item.status,
        label: item.status,
        className: 'bg-secondary text-white',
        icon: 'bi-info-circle',
      },
    ];
  }

  const badges = [];
  const now = Date.now();
  const endTime = item.end_time ? new Date(item.end_time).getTime() : null;
  const createdAt = item.created_at ? new Date(item.created_at).getTime() : null;
  const dayMs = 24 * 60 * 60 * 1000;

  if (endTime && endTime > now && endTime - now <= dayMs) {
    badges.push({
      key: 'about-to-expire',
      label: 'About to expire',
      className: 'bg-warning text-dark',
      icon: 'bi-clock-history',
    });
  }

  if (item.is_limited) {
    badges.push({
      key: 'limited',
      label: 'Limited',
      className: 'bg-danger text-white',
      icon: 'bi-star-fill',
    });
  }

  if (createdAt && now - createdAt <= dayMs) {
    badges.push({
      key: 'new',
      label: 'New',
      className: 'bg-success text-white',
      icon: 'bi-sparkles',
    });
  }

  return badges;
};
