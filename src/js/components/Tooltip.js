/**
 * @copyright syedasifshah 2023
 */

'use strict';


/**
 * Attaches a tooltip to a given DOM element.
 * When the element is hovered over, a tooltip with the spacified content is dispalyed.
 * The tooltip is automatically positioned below the elemnt.
 * 
 * @param {HTMLElement} $element - The DOM element to which the tooltip behavior is added.
 */


export const Tooltip = function ($element) {
    const /** {HTMLElement} */ $tootlip = document.createElement('span');
    $tootlip.classList.add('tooltip', 'text-body-small');

    $element.addEventListener('mouseenter', function () {
        $tootlip.textContent = this.dataset.tooltip;
        
        const {
            top,
            left,
            height,
            width
        } = this.getBoundingClientRect();

        $tootlip.style.top = top + height + 4 + 'px';
        $tootlip.style.left = left + (width / 2) + 'px';
        $tootlip.style.transform = 'translate(-50%, 0)';
        document.body.appendChild($tootlip);
    });

    $element.addEventListener('mouseleave', $tootlip.remove.bind($tootlip));
}