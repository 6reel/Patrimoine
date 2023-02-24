var mutex=0;
	var up=0;
	var down=10;
$(document).ready(function () {

	
    var mapCount = document.getElementsByTagName("area").length;
    var i = 1;

    while (i <= mapCount) {
        var data = $('#hlight' + i).mouseout().data('maphilight') || {};
        data.alwaysOn = !data.alwaysOn;
        $('#hlight' + i).data('maphilight', data).trigger('alwaysOn.maphilight');

        i++;
    }
    $('.map').maphilight({
        fade: false
    });
	
setInterval(function(){
			setMap();
		}, 103);
		
});

function click_highlight(theID) {
    var eID = '#' + theID.id;
    var data = $(eID).mouseout().data('maphilight') || {};
    data.alwaysOn = !data.alwaysOn;
    $(eID).data('maphilight', data).trigger('alwaysOn.maphilight');
}

function reset_hilight() {
	var mapCount = document.getElementsByTagName("area").length;
	var i = 1;
	
	while (i <= mapCount) {
		var data = $('#hlight' + i).mouseout().data('maphilight') || {};
		data.alwaysOn = !data.alwaysOn;
		$('#hlight' + i).data('maphilight', data).trigger('alwaysOn.maphilight');
		i++;
	}
}

	function setMap(){
		if(mutex==0){
			var data = $('.hilight').mouseout().data('maphilight') || {};
			data.fillOpacity = up/10;
			$('.hilight').data('maphilight', data).trigger('alwaysOn.maphilight');
			up++;
			if(up==10){
				mutex=1;
				down=10;
			}
		}else{
			var data = $('.hilight').mouseout().data('maphilight') || {};
			data.fillOpacity = down/10;
			$('.hilight').data('maphilight', data).trigger('alwaysOn.maphilight');
			down--;
			if(down==0){
				mutex=0;
				up=0
			}
		}
	}

/**
 * recalcule les coordonnées suivant les dimensions de l'image référente
 * @param {(null|string)} selector - rien ou sélecteur CSS de l'image ciblée.
 * @example responsiveArea('[usemap="#name-map"]');
 */
function responsiveArea(selector) {
  selector = selector || "[usemap]";
  const elemImage = document.querySelectorAll(selector);
  elemImage.forEach((img) => {
    // get dimension image
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const nomMap = img.getAttribute("usemap");
    // image non encore chargée
    if (!(imgW * imgH)) {
      img.addEventListener("load", () => responsiveArea(`[usemap="${nomMap}"]`));
    }
    // image chargée
    else {
      // récup. data image
      const rapportX = img.width / imgW;
      const rapportY = img.height / imgH;
      // get la map associée
      const elemMap = document.querySelector(`[name="${nomMap.replace("#","")}"]`);
      // quitte si non requis
      if (elemMap.hasAttribute("noresize")) return;
      // get les area enfants
      const elemArea = elemMap.querySelectorAll("area");
      // traitement des area
      elemArea.forEach((area) => {
        const shape = area.getAttribute("shape");
        const originalCoords = area.getAttribute("originalcoords")?.split(",");
        const coords = originalCoords || area.getAttribute("coords")?.split(",");
        // sauve données initiales
        if (!originalCoords) {
          area.setAttribute("originalcoords", coords?.join(","));
        }
        // Attention : pas de test fait sur la validité de l'attribut coords
        // https://html.spec.whatwg.org/multipage/image-maps.html#attr-area-coords
        const newCoords = [];
        switch (shape) {
          case "rect":
          case "poly":
            for (let i = 0; i < coords.length; i += 2) {
              newCoords.push(+coords[i] * rapportX, +coords[i + 1] * rapportY);
            }
            break;
          case "circle":
            newCoords.push(+coords[0] * rapportX, +coords[1] * rapportY, +coords[2] * rapportX);
            break;
          default:
        }
        // affectation
        area.setAttribute("coords", newCoords.join(","));
        // on previent à toutes fins utiles
        area.dispatchEvent(new Event("resize"));
      });
      // demande redim auto
      if (!img._observer) {
        const objObserve = new ResizeObserver(() => {
          clearTimeout(img._innerTimer);
          img._innerTimer = setTimeout(() => responsiveArea(`[usemap="${nomMap}"]`), 100);
        });
        objObserve.observe(img);
        img._observer = true;
      }
    }
  });
}

responsiveArea();