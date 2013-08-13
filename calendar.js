var dows=["Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
var months = ["Январь", "Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ];
today = new Date();
month = today.getMonth();
year = today.getFullYear();

function clone(obj) {
	return $.extend(true, {}, obj);
}

function mktag (tag) {
	return $("<"+tag+"></"+tag+">");
}

function dates_eq(d1,d2){
	return d1.getFullYear()==d2.getFullYear() &&
		d1.getMonth()==d2.getMonth() &&
		d1.getDate()==d2.getDate();
}

function fill_calendar(d){
	var fdm = new Date(d.getFullYear(), d.getMonth(), 1);
	var ldm = new Date(d.getFullYear(), d.getMonth()+1, 0);

	var month = d.getMonth();
	var offset1 = fdm.getDay() == 0 ? 7 : fdm.getDay();
	var offset2 = 6 - ldm.getDay();
	var dayCount = offset1+offset2+ldm.getDate();

	var day = new Date(fdm.setDate(fdm.getDate() - offset1 + 1));
	var i = 0;

	$("#calendar").html(mktag("tbody"));
	$("#calendar tbody").append(mktag("tr"));
	while(i < dayCount){
		var dow = i < 7 ? dows[i]+", " : "";
		var td = mktag("td").append(dow+day.getDate()).addClass("day");;
		if(dates_eq(today, day)){
			td.addClass("today");
		}
		day.setDate(day.getDate() +1);
		if(i%7 == 0 && i > 0){
			$("#calendar").append(mktag("tr"));

		}
		$("#calendar tr:last").append(td);
		i++;
	}
	$("#month").html(months[d.getMonth()]+" "+d.getFullYear());
}

function incMonth () {
	if (month == 11) {
		year++;
		month = 0;
	}else month++;
	var nd = new Date(year, month, 1);
	fill_calendar(dates_eq(today,nd) ? today : nd);
}
function decMonth () {
	if (month == 0) {
		year--;
		month = 11;
	}else month--;
	var nd = new Date(year, month, 1);
	fill_calendar(dates_eq(today,nd) ? today : nd);
}


$(document).ready(function() {

	$("#next-month").on("click",function() {
		incMonth();
	});
	$("#prev-month").on("click",function() {
		decMonth();
	});

	fill_calendar(today);
});


