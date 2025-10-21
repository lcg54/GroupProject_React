const DoubleCircle = () => (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
        <div
            style={{
                width: '50px',
                height: '50px',
                border: '3px solid #333',
                borderRadius: '50%',
                position: 'absolute',
                left: 0,
                top: 0,
                backgroundColor: 'transparent',
                zIndex: 1,
            }}
        />
        <div
            style={{
                width: '50px',
                height: '50px',
                border: '3px solid #333',
                borderRadius: '50%',
                position: 'absolute',
                left: '30px',
                top: 0,
                backgroundColor: 'transparent',
                zIndex: 2,
            }}
        />
    </div>
);
export default DoubleCircle;