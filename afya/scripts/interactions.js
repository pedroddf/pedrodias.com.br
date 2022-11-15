//var scormAPI = findAPI(window);
var scormAPI = getAPIHandle();
var topicIsFinished;
var finishOwlNavigation;
var acceptedTermDate;
var studentName;
const LESSON_STATUS = {
    notAttempted: 'not attempted',
    incomplete: 'incomplete',
    completed: 'completed',
    passed: 'passed',
    failed: 'failed'
}
const FIELDS = {
    lessoLocation: 'cmi.core.lesson_location',
    lessoStatus: 'cmi.core.lesson_status',
    supendData: 'cmi.suspend_data',
    studentName: 'cmi.core.student_name',
}

$(window).bind('load', function () {

    if (scormAPI) {
        loadPage();

        var interval = setInterval(function () {

            if (LMSIsInitialized()) {
                clearInterval(interval);
                initTopic();
            }
        })
    }
    else {
        initTopic()
    }

    function initTopic() {
        finishOwlNavigation = false;
        topicIsFinished = getScormData(FIELDS.lessoStatus) === LESSON_STATUS.completed;
        acceptedTermDate = getScormData(FIELDS.supendData);
        studentName = getScormData(FIELDS.studentName) || "COLABORADOR";

        /**
         * Add student name
         **/
        $(".student-name").html(studentName);

        /**
         * Init course
         **/
        $(".init-course").click(initCourse);

        function initCourse() {
            top.location = "#";
            // top.location = "https://nre.instructure.com/courses/52/pages/sumario?module_item_id=2731";

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                top.location = "screen-1.html";
            }
        }

        /**
         * Modal 
         **/
        $("[data-action='modal']").click(openModal);

        function openModal(event) {
            var current = ~~$(this).attr("data-button");

            event.preventDefault();

            $("[data-title]").hide();
            $("[data-content]").hide();

            $.each($("[data-action='modal']"), function (index) {
                if ((index + 1) == current) {
                    $($("[data-title]").get(index)).show();
                    $($("[data-content]").get(index)).show();
                }

            });

            $("#modal").modal('show');
        }

        /**
         * Accordion 
         **/
        $("[data-action='accordion']").find(".item:not(.active) .text").animate({
            height: 0,
            paddingTop: 0,
            paddingBottom: 0
        }, 0);

        $(".active .fa").removeClass('fa-angle-down').addClass("fa-angle-up");

        $("[data-action='accordion']").find(".item").click(itemAccordion);

        function itemAccordion() {
            $.each($(this).parent().find(".item"), function (index) {

                $(this).removeClass("active");

                $(this).find("i").addClass("fa-angle-down").removeClass('fa-angle-up');

                $(this).find(".text").animate({
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                }, 'fast');
            });

            $(this).addClass("active");

            $(this).find("i").addClass("fa-angle-up").removeClass('fa-angle-down');

            $(this).find(".text").stop().animate({
                height: '100%',
                paddingTop: 30,
                paddingBottom: 30
            }, 'fast');
        }

        /**
         * Alternate 
         **/
        $("[data-action='alternate']").find('.tab').click(changeTab);

        $("[data-content]:not(.active)").hide();

        function changeTab() {
            var current = ~~$(this).attr("data-button");

            $("[data-content]").hide();

            $("[data-button]").removeClass('active');
            $(this).addClass('active');

            $($("[data-content]").get(current - 1)).fadeIn();
        }

        /**
         * Navigation
         **/
        $('.navigation.owl-carousel').owlCarousel({
            margin: 5,
            loop: false,
            nav: true,
            items: 1,
            navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
            autoHeight: true,
            responsive:{
                767:{
                    dots: true
                },
                768:{
                    dots: false
                }
            }
        });

        /**
        * Menu of videos 
        **/
        $(".menu-button").click(toggleMenu);
        $(".item-menu").click(changeVideo);
        $(".item-menu:first-child").trigger("click");

        $(".menu-video").hide();

        function toggleMenu() {
            $(".menu-video").fadeToggle();
        }

        function changeVideo(event) {
            var idVideo = $(this).attr("data-video");

            $(".video-area iframe").attr("src", "https://player.vimeo.com/video/" + idVideo);

            $(".menu-video").fadeOut();
        }

        /**
         * More info 
         **/
        $(".more-info .click").click(moreInfo);
        $(".more-info .content-info").hide();

        function moreInfo(event) {
            var content = $(event.target).parent().find(".content-info");
            content.fadeIn();
            $(event.target).parent().find(".hide").hide();
        }

        /**
         * Accepted term 
         **/
        $(".accepted-term").click(acceptedTerm);

        function acceptedTerm(event) {

            acceptedText(new Date())

            setScormData(FIELDS.supendData, new Date(), true);

            finishTopic();
        }

        function acceptedText(date){
            // Format date and hours
            var day = new Date(date).getDate();
            var month = new Date(date).getMonth() + 1;
            var year = new Date(date).getFullYear();
            var horary = new Date(date).toTimeString().split(" ")[0];
            var strDateInfo;
            
            day = day < 10 ? '0' + day : day;
            month = month < 10 ? '0' + month : month;
            strDateInfo = day + '/' + month + '/' + year + " às " + horary;

            $('.accepted-term').attr('disabled', true);
            $('.accepted-term').hide();
            $('.accepted-term-message').addClass('color-5');
            $('.accepted-term-message').html("<div class='box box-padding-double box-border-left box-border-left-green'><img src='assets/imgs/icon_aceite_2.png'> <strong>Você aceitou o termo em " + strDateInfo + "</strong></div>");
        }

        if ($('.accepted-term').length == 0) {
            finishTopic();
        } else {
            if (acceptedTermDate) {
                acceptedText(acceptedTermDate);
            }
            else {
                $('.accepted-term-message').html("<div class='box box-padding-double box-border-left'><img src='assets/imgs/icon_aceite_1.png'> É necessário clicar em <strong>ACEITO</strong> para finalizar o treinamento.</div>");
            }

        }
    }

    function getScormData(field) {
        if (scormAPI) {
            return doLMSGetValue(field);
        }
    }

    function setScormData(field, value, commit) {
        if (scormAPI) {
            doLMSSetValue(field, value);

            if (commit) {
                doLMSCommit('');
            }
        }
    }

    function finishTopic() {
        if (!topicIsFinished) {
            setScormData(FIELDS.lessoStatus, LESSON_STATUS.completed, true)
        }
    }

});

$(window).bind('beforeunload', function () {
    if (scormAPI) {
        unloadPage();
    }
});