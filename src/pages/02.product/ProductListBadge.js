
export const PopularBadge = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: '#FFC107',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      인기상품
    </div>
  );
}

export const NotAvailableBadge = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: '#FF3B30',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      재고소진
    </div>
  );
}

export const WishListBadge = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        right: 10,
        background: 'rgba(0, 180, 105, 0.75)',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        zIndex: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      찜
    </div>
  );
}