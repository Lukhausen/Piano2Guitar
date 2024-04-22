document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    let draggingEle, yOffset, xOffset;

    function mouseDownHandler(e) {
        draggingEle = e.target;
        yOffset = e.clientY - draggingEle.getBoundingClientRect().top;
        xOffset = e.clientX - draggingEle.getBoundingClientRect().left;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    function mouseMoveHandler(e) {
        draggingEle.style.position = 'absolute';
        draggingEle.style.top = `${e.clientY - yOffset}px`;
        draggingEle.style.left = `${e.clientX - xOffset}px`;
        // Logic to reorder items based on their position goes here
    }

    function mouseUpHandler() {
        draggingEle.style.position = 'static';
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        draggingEle = null;
    }

    document.querySelectorAll('.draggable').forEach(ele => {
        ele.addEventListener('mousedown', mouseDownHandler);
    });
});
