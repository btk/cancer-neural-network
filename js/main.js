var uygulama = angular.module("ngUygulamam", []);

uygulama.controller("ngKontrol", function($scope, $http) {
    var arrayRawData = [];
    var arrayNormalized = [];
    var learningRate = 0.1;
    var minAge = 100,
        minYear = 100,
        minNode = 100;
    var maxAge = 0,
        maxYear = 0,
        maxNode = 0;

    var hiddenLayerNodeNumber = 5;
    var hiddenLayerNodes = [];
    var weightSet1 = [];
    var weightSet2 = [];
    var prevWeightSet2;

    $http.get("rawdata.txt").then(function(resp) {
        resp.data.split("\n").forEach(function(setItem) {
            if (setItem) {
                arrayRawData.push(setItem.split(","));
            }
        });
    });
    $scope.findPeaks = function() {
        var i = 0;
        while (i < arrayRawData.length) {
            if (minAge > parseInt(arrayRawData[i][0])) {
                minAge = parseInt(arrayRawData[i][0]);
            }
            if (maxAge < parseInt(arrayRawData[i][0])) {
                maxAge = parseInt(arrayRawData[i][0]);
            }
            if (minYear > parseInt(arrayRawData[i][1])) {
                minYear = parseInt(arrayRawData[i][1]);
            }
            if (maxYear < parseInt(arrayRawData[i][1])) {
                maxYear = parseInt(arrayRawData[i][1]);
            }
            if (minNode > parseInt(arrayRawData[i][2])) {
                minNode = parseInt(arrayRawData[i][2]);
            }
            if (maxNode < parseInt(arrayRawData[i][2])) {
                maxNode = parseInt(arrayRawData[i][2]);
            }
            i++;
        }
    }

    $scope.normalize = function() {
        arrayRawData.forEach(function(setItem) {
            var tempSetItem = [];
            tempSetItem.push(calculateMinMax(minAge, maxAge, setItem[0]));
            tempSetItem.push(calculateMinMax(minYear, maxYear, setItem[1]));
            tempSetItem.push(calculateMinMax(minNode, maxNode, setItem[2]));
            tempSetItem.push(parseInt(setItem[3]) - 1);
            arrayNormalized.push(tempSetItem);
        });
    }

    var shuffle = function(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }
    var calculateMinMax = function(min, max, num) {
        var numb = (parseInt(num) - min) / (max - min);
        return numb;
    }
    var randomizeWeights = function() {
        var j = 0;
        while (j < 3) {
            var tempWeightSet = [];
            var i = 0;
            while (i < hiddenLayerNodeNumber) {
                tempWeightSet.push(0.5); // Math.random()
                i++;
            }
            weightSet1.push(tempWeightSet);
            j++;
        }

        var j = 0;
        while (j < hiddenLayerNodeNumber) {
            weightSet2.push(Math.random());
            j++;
        }
    }
    var createHiddenNodes = function() {
        i = 0;
        while (i < hiddenLayerNodeNumber) {
            hiddenLayerNodes.push(0);
            i++;
        }
    }
    var queue = function(data) {
        var i = 0;
        var age = data[0];
        var year = data[1];
        var node = data[2];
        var survival = data[3];
        var alfa;
        while (i < hiddenLayerNodeNumber) {
            alfa = (weightSet1[0][i] * age) + (weightSet1[1][i] * year) + (weightSet1[2][i] * node);
            hiddenLayerNodes[i] = 1 / (Math.pow(Math.E, alfa * (-1)) + 1);
            i++;
        }
        var j = 0;
        var sumOfSet2 = 0;
        while (j < hiddenLayerNodeNumber) {
            sumOfSet2 += weightSet2[j] * hiddenLayerNodes[j];
            j++;
        }
        var result = 1 / (Math.pow(Math.E, sumOfSet2 * (-1)) + 1);

        var error = Math.pow(survival - result, 2) / 2;
        //error
        //result
        //alfa
        //gülenyüz
        var b = 0;
        var tempResult;
        prevWeightSet2 = weightSet2;
        while (b < hiddenLayerNodeNumber) {
            tempResult = 0;
            tempResult = (-1) * (survival - result) * (result * (1 - result)) * hiddenLayerNodes[b];
            tempResult = weightSet2[b] - learningRate * tempResult; // + - emin değiliz.
            weightSet2[b] = tempResult;
            b++;
        }

        var d = 0;
        var c = 0;
        var tempOldWeightResult;
        while (d < hiddenLayerNodeNumber) {
            c = 0;
            tempOldWeightResult = (-1) * (survival - result) * (result * (1 - result)) * prevWeightSet2[d];
            while (c < 3) {
                var conclusion = 0;
                var tempPref = learningRate * tempOldWeightResult * (hiddenLayerNodes[d] * (1 - hiddenLayerNodes[d]));
                if (c == 0) {
                    conclusion = tempPref * age;
                } else if (c == 1) {
                    conclusion = tempPref * year;
                } else if (c == 2) {
                    conclusion = tempPref * node;
                }
                weightSet1[c][d] = weightSet1[c][d] - conclusion;
                c++;
            }
            d++;
        }
    }

    var check = function(data) {
        var i = 0;
        var age = data[0];
        var year = data[1];
        var node = data[2];
        var survival = data[3];
        var alfa;
        while (i < hiddenLayerNodeNumber) {
            alfa = (weightSet1[0][i] * age) + (weightSet1[1][i] * year) + (weightSet1[2][i] * node);
            hiddenLayerNodes[i] = 1 / (Math.pow(Math.E, alfa * (-1)) + 1);
            i++;
        }
        var j = 0;
        var sumOfSet2 = 0;
        while (j < hiddenLayerNodeNumber) {
            sumOfSet2 += weightSet2[j] * hiddenLayerNodes[j];
            j++;
        }
        var result = 1 / (Math.pow(Math.E, sumOfSet2 * (-1)) + 1);

        var error = Math.pow(survival - result, 2) / 2;
        console.log(error);
    }

    $scope.init = function() {

        shuffle(arrayNormalized);
        randomizeWeights();
        createHiddenNodes();
    }

    $scope.teachAll = function() {
        var t = 0;
        while (t < 100) {
            var a = 0;
            while (a < arrayNormalized.length * 0.8) {
                queue(arrayNormalized[a]);
                a++;
            }
            t++;
        }
    }

    $scope.checkIntegrity = function() {
        var a = parseInt(arrayNormalized.length * 0.8);
        while (a < arrayNormalized.length) {
            check(arrayNormalized[a]);
            a++;
        }
    }

});
