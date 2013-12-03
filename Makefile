PREFIX = .

BUILD_DIR = ${PREFIX}/build
DOCS_DIR = ${PREFIX}/docs
DIST_DIR = ${PREFIX}/dist

SRC_DIR = ${PREFIX}/src

BASE_FILES = ${SRC_DIR}/core.js\
	${SRC_DIR}/ClassEvent.js\
	${SRC_DIR}/ajax.js\
	${SRC_DIR}/json.js\
	${SRC_DIR}/comet.js\
	${SRC_DIR}/socket.js\
	${SRC_DIR}/cookie.js\
	${SRC_DIR}/log.js\
	${SRC_DIR}/webim.js\
	${SRC_DIR}/setting.js\
	${SRC_DIR}/status.js\
	${SRC_DIR}/buddy.js\
	${SRC_DIR}/room.js\
	${SRC_DIR}/history.js \


WEBIM_FILES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

WEBIM_VER = `cat ${PREFIX}/version.txt`
DATE=`git log -n 1  --pretty=format:%ad`
COMMIT=`git log -n 1 --pretty=format:%H`


REPLACE = sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@COMMIT/'"${COMMIT}"'/' | \
		sed s/@VERSION/${WEBIM_VER}/

#REPLACE = sed s/@VERSION/${WEBIM_VER}/

JSMINJAR = java -jar ${BUILD_DIR}/google-compiler-20100616.jar
UNICODE = native2ascii -encoding utf-8 

WEBIM_JS = ${DIST_DIR}/webim.js

WEBIM_MIN_JS = ${DIST_DIR}/webim.min.js

all: ${DIST_DIR} ${WEBIM_JS} ${WEBIM_MIN_JS}
	@@echo "Build complete."

webim: ${WEBIM_JS}
	@@echo "Complete."

${DIST_DIR}:
	@@echo "Create distribution directory"
	@@mkdir -p ${DIST_DIR}
	@@echo "	"${DIST_DIR}

${WEBIM_JS}: ${DIST_DIR}
	@@echo "Merge file"
	@@cat ${WEBIM_FILES} | \
		${REPLACE} > ${WEBIM_JS};
	@@cp ${WEBIM_JS} ../webim-ui/
	@@echo "	"${WEBIM_JS}

${WEBIM_MIN_JS}: ${WEBIM_JS}
	@@echo "Compressing..."
	@@head -10 ${WEBIM_JS} > ${WEBIM_MIN_JS}
	@@${JSMINJAR} --js ${WEBIM_JS} --warning_level QUIET >> ${WEBIM_MIN_JS}
	@@echo "	"${WEBIM_MIN_JS}

clean:
	@@echo "Remove distribution directory" 
	@@rm -rf ${DIST_DIR}
	@@echo "	"${DIST_DIR}

